package com.safeschool.backend.service;

import com.safeschool.backend.dto.NotificacionResponse;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final EstudianteRepository estudianteRepository;
    private final EmergenciaRepository emergenciaRepository;
    private final NotificacionRepository notificacionRepository;
    private final MensajeIAService mensajeIAService;

    public NotificacionService(EstudianteRepository estudianteRepository,
            EmergenciaRepository emergenciaRepository,
            NotificacionRepository notificacionRepository,
            MensajeIAService mensajeIAService) {
        this.estudianteRepository = estudianteRepository;
        this.emergenciaRepository = emergenciaRepository;
        this.notificacionRepository = notificacionRepository;
        this.mensajeIAService = mensajeIAService;
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
        String mensaje = mensajeIAService.generarMensajeSeguridad(
                estudiante.getNombre(),
                emergencia.getTipo().name());

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(apoderado);
        notificacion.setEstudiante(estudiante);
        notificacion.setEmergencia(emergencia);
        notificacion.setMensaje(mensaje);
        notificacion.setEstado(EstadoNotificacion.ENVIADA);
        notificacionRepository.save(notificacion);
    }
}
