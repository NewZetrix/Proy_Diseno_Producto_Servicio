package com.safeschool.backend.service;

import com.safeschool.backend.dto.NotificacionResponse;
import com.safeschool.backend.exception.AccesoNoAutorizadoException;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class NotificacionService {

    private static final String TITULO_PUSH = "SafeSchool: estudiante a salvo";

    private final DispositivoRepository dispositivoRepository;
    private final EstudianteRepository estudianteRepository;
    private final EmergenciaRepository emergenciaRepository;
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final Optional<PushNotificationSender> pushNotificationSender;

    public NotificacionService(DispositivoRepository dispositivoRepository,
                              EstudianteRepository estudianteRepository,
                              EmergenciaRepository emergenciaRepository,
                              NotificacionRepository notificacionRepository,
                              UsuarioRepository usuarioRepository,
                              Optional<PushNotificationSender> pushNotificationSender) {
        this.dispositivoRepository = dispositivoRepository;
        this.estudianteRepository = estudianteRepository;
        this.emergenciaRepository = emergenciaRepository;
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.pushNotificationSender = pushNotificationSender;
    }

    @Transactional
    public void registrarTokenDispositivo(Integer usuarioId, String tokenFcm) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        if (usuario.getRol() != Rol.PADRE) {
            throw new AccesoNoAutorizadoException("Solo un apoderado puede registrar dispositivos.");
        }

        Dispositivo dispositivo = dispositivoRepository.findByTokenFcm(tokenFcm)
                .orElseGet(Dispositivo::new);
        dispositivo.setTokenFcm(tokenFcm);
        dispositivo.setUsuario(usuario);
        dispositivoRepository.save(dispositivo);
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNotificacionesPorPadre(Integer padreId) {
        return notificacionRepository.findByUsuario_IdOrderByFechaCreacionDesc(padreId).stream()
                .map(notificacion -> new NotificacionResponse(
                        notificacion.getId(),
                        notificacion.getMensaje(),
                        notificacion.getEstado().name(),
                        notificacion.getFechaCreacion()))
                .toList();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notificarSalonConfirmado(Long emergenciaId, Long salonId) {
        Emergencia emergencia = emergenciaRepository.findById(emergenciaId.intValue())
                .orElseThrow(() -> new RecursoNoEncontradoException("Emergencia no encontrada"));

        List<Estudiante> estudiantes = estudianteRepository.findBySalon_Id(salonId.intValue());
        for (Estudiante estudiante : estudiantes) {
            enviarNotificacion(estudiante, emergencia);
        }
    }

    private void enviarNotificacion(Estudiante estudiante, Emergencia emergencia) {
        Usuario apoderado = estudiante.getApoderado();
        String mensaje = "Su hijo/a " + estudiante.getNombre()
                + " se encuentra a salvo en el colegio. Emergencia: "
                + emergencia.getTipo().name() + ".";

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(apoderado);
        notificacion.setEstudiante(estudiante);
        notificacion.setEmergencia(emergencia);
        notificacion.setMensaje(mensaje);
        notificacion.setEstado(EstadoNotificacion.FALLIDA);
        notificacion = notificacionRepository.save(notificacion);

        List<Dispositivo> dispositivos = dispositivoRepository.findByUsuario_Id(apoderado.getId());
        boolean enviada = false;
        if (dispositivos.isEmpty()) {
            log.warn("Push no enviado para notificación {}: el apoderado {} no tiene dispositivos registrados",
                    notificacion.getId(), apoderado.getId());
        }
        for (Dispositivo dispositivo : dispositivos) {
            if (enviarConReintento(dispositivo.getTokenFcm(), mensaje, notificacion.getId())) {
                enviada = true;
            }
        }

        notificacion.setEstado(enviada ? EstadoNotificacion.ENVIADA : EstadoNotificacion.FALLIDA);
        notificacionRepository.save(notificacion);
    }

    private boolean enviarConReintento(String token, String mensaje, Long notificacionId) {
        if (pushNotificationSender.isEmpty()) {
            log.warn("Push no enviado para notificación {}: Firebase no está configurado", notificacionId);
            return false;
        }

        for (int intento = 1; intento <= 2; intento++) {
            try {
                pushNotificationSender.get().enviar(token, TITULO_PUSH, mensaje);
                return true;
            } catch (Exception error) {
                log.warn("Falló el envío push de la notificación {} (intento {}/2): {}",
                        notificacionId, intento, error.getMessage());
            }
        }
        return false;
    }
}
