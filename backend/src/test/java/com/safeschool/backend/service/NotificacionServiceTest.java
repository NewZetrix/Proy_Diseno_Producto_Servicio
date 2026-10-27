package com.safeschool.backend.service;

import com.safeschool.backend.exception.AccesoNoAutorizadoException;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private DispositivoRepository dispositivoRepository;

    @Mock
    private EstudianteRepository estudianteRepository;

    @Mock
    private EmergenciaRepository emergenciaRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PushNotificationSender pushNotificationSender;

    private NotificacionService notificacionService;

    @BeforeEach
    void preparar() {
        notificacionService = new NotificacionService(
                dispositivoRepository,
                estudianteRepository,
                emergenciaRepository,
                notificacionRepository,
                usuarioRepository,
                Optional.of(pushNotificationSender));
    }

    @Test
    void creaUnaNotificacionPorEstudianteYLasEnviaAlDispositivoDelApoderado() throws Exception {
        Usuario apoderado = usuarioPadre(4);
        Estudiante primero = estudiante(10, "Diego", apoderado);
        Estudiante segundo = estudiante(11, "Ana", apoderado);
        Emergencia emergencia = emergencia(1);
        Dispositivo dispositivo = new Dispositivo();
        dispositivo.setTokenFcm("token-prueba");

        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));
        when(estudianteRepository.findBySalon_Id(2)).thenReturn(List.of(primero, segundo));
        when(dispositivoRepository.findByUsuario_Id(4)).thenReturn(List.of(dispositivo));
        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(pushNotificationSender).enviar(any(), any(), any());

        notificacionService.notificarSalonConfirmado(1L, 2L);

        verify(pushNotificationSender).enviar(
                eq("token-prueba"), any(), contains("Diego"));
        verify(pushNotificationSender).enviar(
                eq("token-prueba"), any(), contains("Ana"));

        ArgumentCaptor<Notificacion> notificacionCaptor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository, times(4)).save(notificacionCaptor.capture());
        List<Notificacion> guardadas = notificacionCaptor.getAllValues();
        assertEquals(EstadoNotificacion.ENVIADA, guardadas.get(1).getEstado());
        assertEquals(EstadoNotificacion.ENVIADA, guardadas.get(3).getEstado());
        assertEquals(primero, guardadas.get(1).getEstudiante());
        assertEquals(emergencia, guardadas.get(1).getEmergencia());
    }

    @Test
    void reintentaUnaVezSiElPrimerEnvioPushFalla() throws Exception {
        Usuario apoderado = usuarioPadre(4);
        Estudiante estudiante = estudiante(10, "Diego", apoderado);
        Dispositivo dispositivo = new Dispositivo();
        dispositivo.setTokenFcm("token-prueba");

        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia(1)));
        when(estudianteRepository.findBySalon_Id(2)).thenReturn(List.of(estudiante));
        when(dispositivoRepository.findByUsuario_Id(4)).thenReturn(List.of(dispositivo));
        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new IllegalStateException("Fallo transitorio"))
                .doNothing()
                .when(pushNotificationSender).enviar(any(), any(), any());

        notificacionService.notificarSalonConfirmado(1L, 2L);

        verify(pushNotificationSender, times(2)).enviar(any(), any(), any());
        ArgumentCaptor<Notificacion> notificacionCaptor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository, times(2)).save(notificacionCaptor.capture());
        assertEquals(EstadoNotificacion.ENVIADA,
                notificacionCaptor.getAllValues().get(1).getEstado());
    }

    @Test
    void conservaLaNotificacionComoFallidaSiNoHayDispositivoRegistrado() throws Exception {
        Usuario apoderado = usuarioPadre(4);
        Estudiante estudiante = estudiante(10, "Diego", apoderado);
        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia(1)));
        when(estudianteRepository.findBySalon_Id(2)).thenReturn(List.of(estudiante));
        when(dispositivoRepository.findByUsuario_Id(4)).thenReturn(List.of());
        when(notificacionRepository.save(any(Notificacion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        notificacionService.notificarSalonConfirmado(1L, 2L);

        ArgumentCaptor<Notificacion> notificacionCaptor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository, times(2)).save(notificacionCaptor.capture());
        assertEquals(EstadoNotificacion.FALLIDA,
                notificacionCaptor.getAllValues().get(1).getEstado());
        verify(pushNotificationSender, never()).enviar(any(), any(), any());
        assertTrue(notificacionCaptor.getValue().getMensaje().contains("SISMO"));
    }

    @Test
    void registraTokenAsociadoAlApoderadoAutenticado() {
        Usuario apoderado = usuarioPadre(4);
        when(usuarioRepository.findById(4)).thenReturn(Optional.of(apoderado));
        when(dispositivoRepository.findByTokenFcm("token-prueba")).thenReturn(Optional.empty());

        notificacionService.registrarTokenDispositivo(4, "token-prueba");

        ArgumentCaptor<Dispositivo> dispositivoCaptor = ArgumentCaptor.forClass(Dispositivo.class);
        verify(dispositivoRepository).save(dispositivoCaptor.capture());
        assertEquals(apoderado, dispositivoCaptor.getValue().getUsuario());
        assertEquals("token-prueba", dispositivoCaptor.getValue().getTokenFcm());
    }

    @Test
    void rechazaQueUnUsuarioQueNoSeaApoderadoRegistreUnToken() {
        Usuario docente = new Usuario();
        docente.setId(3);
        docente.setRol(Rol.DOCENTE);
        when(usuarioRepository.findById(3)).thenReturn(Optional.of(docente));

        assertThrows(AccesoNoAutorizadoException.class,
                () -> notificacionService.registrarTokenDispositivo(3, "token-prueba"));

        verify(dispositivoRepository, never()).save(any(Dispositivo.class));
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
