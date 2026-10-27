package com.safeschool.backend.service;

import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private EmergenciaRepository emergenciaRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    private NotificacionService notificacionService;

    @BeforeEach
    void preparar() {
        notificacionService = new NotificacionService(
                estudianteRepository,
                emergenciaRepository,
                notificacionRepository);
    }

    @Test
    void creaUnaNotificacionDisponiblePorCadaEstudianteDelSalon() {
        Usuario apoderado = usuarioPadre(4);
        Estudiante primero = estudiante(10, "Diego", apoderado);
        Estudiante segundo = estudiante(11, "Ana", apoderado);
        Emergencia emergencia = emergencia(1);

        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));
        when(estudianteRepository.findBySalon_Id(2)).thenReturn(List.of(primero, segundo));
        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        notificacionService.notificarSalonConfirmado(1L, 2L);

        ArgumentCaptor<Notificacion> notificacionCaptor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository, times(2)).save(notificacionCaptor.capture());
        List<Notificacion> guardadas = notificacionCaptor.getAllValues();
        assertEquals(EstadoNotificacion.ENVIADA, guardadas.get(0).getEstado());
        assertEquals(EstadoNotificacion.ENVIADA, guardadas.get(1).getEstado());
        assertEquals(primero, guardadas.get(0).getEstudiante());
        assertEquals(emergencia, guardadas.get(0).getEmergencia());
        assertEquals("Su hijo/a Diego se encuentra a salvo en el colegio. Emergencia: SISMO.",
                guardadas.get(0).getMensaje());
        assertEquals("Su hijo/a Ana se encuentra a salvo en el colegio. Emergencia: SISMO.",
                guardadas.get(1).getMensaje());
    }

    @Test
    void devuelveLaNotificacionConEstadoYFechaDelApoderadoSolicitado() {
        Notificacion notificacion = new Notificacion();
        notificacion.setId(8L);
        notificacion.setMensaje("Su hijo/a Diego se encuentra a salvo. Emergencia: SISMO.");
        notificacion.setEstado(EstadoNotificacion.ENVIADA);
        notificacion.setFechaCreacion(LocalDateTime.of(2026, 10, 27, 12, 0));
        when(notificacionRepository.findByUsuario_IdOrderByFechaCreacionDesc(4))
                .thenReturn(List.of(notificacion));

        var resultado = notificacionService.obtenerNotificacionesPorPadre(4);

        assertEquals(1, resultado.size());
        assertEquals(8L, resultado.getFirst().id());
        assertEquals("ENVIADA", resultado.getFirst().estado());
        assertEquals(notificacion.getFechaCreacion(), resultado.getFirst().fechaCreacion());
    }

    private Usuario usuarioPadre(int id) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setRol(Rol.PADRE);
        return usuario;
    }

    private Estudiante estudiante(int id, String nombre, Usuario apoderado) {
        Estudiante estudiante = new Estudiante();
        estudiante.setId(id);
        estudiante.setNombre(nombre);
        estudiante.setApoderado(apoderado);
        return estudiante;
    }

    private Emergencia emergencia(int id) {
        Emergencia emergencia = new Emergencia();
        emergencia.setId(id);
        emergencia.setTipo(TipoEmergencia.SISMO);
        return emergencia;
    }
}
