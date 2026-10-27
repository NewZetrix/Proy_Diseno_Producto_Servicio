package com.safeschool.backend.service;

import com.safeschool.backend.dto.NotificacionResponse;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.DispositivoRepository;
import com.safeschool.backend.repository.EstudianteRepository;
import com.safeschool.backend.repository.NotificacionRepository;
import com.safeschool.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    private final DispositivoRepository dispositivoRepository;
    private final NotificacionRepository notificacionRepository;
    private final EstudianteRepository estudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final MensajeIAService mensajeIAService;

    /**
     * Registra o actualiza el token FCM del apoderado.
     */
    @Transactional
    public void registrarTokenDispositivo(Long usuarioId, String tokenFcm) {
        Integer id = usuarioId.intValue();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        dispositivoRepository.findByUsuarioIdAndTokenFcm(id, tokenFcm)
                .ifPresentOrElse(
                        dispositivo -> {
                            dispositivo.setActualizadoEn(LocalDateTime.now());
                            dispositivoRepository.save(dispositivo);
                        },
                        () -> {
                            Dispositivo nuevo = new Dispositivo();
                            nuevo.setUsuario(usuario);
                            nuevo.setTokenFcm(tokenFcm);
                            nuevo.setActualizadoEn(LocalDateTime.now());
                            dispositivoRepository.save(nuevo);
                        }
                );
    }

    /**
     * Lista las notificaciones del padre ordenadas de más reciente a más antigua.
     */
    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNotificacionesPorPadre(Long padreId) {
        return notificacionRepository.findByUsuarioIdOrderByCreadoEnDesc(padreId.intValue())
                .stream()
                .map(n -> new NotificacionResponse(
                        n.getId(),
                        n.getMensaje(),
                        n.getEstado().name(),
                        n.getCreadoEn()
                ))
                .toList();
    }

    /**
     * Se llama después de confirmar un salón.
     * Crea una notificación por cada estudiante del salón y la envía al apoderado.
     * Nunca lanza excepción hacia arriba (no debe romper la confirmación).
     */
    @Transactional
    public void notificarPadresPorSalon(Salon salon, TipoEmergencia tipoEmergencia) {
        try {
            List<Estudiante> estudiantes = estudianteRepository.findBySalonId(salon.getId());

            for (Estudiante estudiante : estudiantes) {
                Usuario apoderado = estudiante.getApoderado();
                if (apoderado == null) continue;

                String mensaje = mensajeIAService.generarMensajeSeguridad(
                        estudiante.getNombre(),
                        tipoEmergencia.name()
                );

                Notificacion notificacion = new Notificacion();
                notificacion.setUsuario(apoderado);
                notificacion.setMensaje(mensaje);
                notificacion.setCreadoEn(LocalDateTime.now());

                // Intentamos enviar por FCM
                boolean enviado = enviarPush(apoderado.getId(), mensaje);
                notificacion.setEstado(enviado ? EstadoNotificacion.ENVIADA : EstadoNotificacion.FALLIDA);

                notificacionRepository.save(notificacion);
            }
        } catch (Exception e) {
            // Nunca rompemos la confirmación del salón
            log.error("Error al notificar padres del salón {}: {}", salon.getId(), e.getMessage());
        }
    }

    /**
     * Envío de push. En PMV1 puede ser simulado.
     * Cuando tengas Firebase configurado, reemplaza el cuerpo de este método.
     */
    private boolean enviarPush(Integer usuarioId, String mensaje) {
        List<Dispositivo> dispositivos = dispositivoRepository.findByUsuarioId(usuarioId);

        if (dispositivos.isEmpty()) {
            log.warn("Usuario {} no tiene dispositivos registrados. Notificación guardada como FALLIDA.", usuarioId);
            return false;
        }

        boolean alMenosUnoEnviado = false;

        for (Dispositivo dispositivo : dispositivos) {
            try {
                // TODO: Aquí va la llamada real a Firebase Cloud Messaging
                // Por ahora simulamos éxito si hay token
                log.info("Push simulado → token={} mensaje={}", dispositivo.getTokenFcm(), mensaje);
                alMenosUnoEnviado = true;
            } catch (Exception e) {
                log.error("Falló envío FCM al token {}: {}", dispositivo.getTokenFcm(), e.getMessage());
            }
        }

        return alMenosUnoEnviado;
    }
}