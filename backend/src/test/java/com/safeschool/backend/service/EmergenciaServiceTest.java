package com.safeschool.backend.service;

import com.safeschool.backend.dto.ActivarEmergenciaRequest;
import com.safeschool.backend.dto.EmergenciaResponse;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.exception.AccesoNoAutorizadoException;
import com.safeschool.backend.exception.ConflictoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.ConfirmacionSalonRepository;
import com.safeschool.backend.repository.EmergenciaRepository;
import com.safeschool.backend.repository.SalonRepository;
import com.safeschool.backend.repository.UsuarioRepository;
import com.safeschool.backend.security.UsuarioAutenticado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmergenciaServiceTest {

    @Mock
    private EmergenciaRepository emergenciaRepository;

    @Mock
    private SalonRepository salonRepository;

    @Mock
    private ConfirmacionSalonRepository confirmacionSalonRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private EmergenciaService emergenciaService;

    @BeforeEach
    void preparar() {
        emergenciaService = new EmergenciaService(
                emergenciaRepository, salonRepository, confirmacionSalonRepository, usuarioRepository);
    }

    @Test
    void activarEmergenciaCreaUnaConfirmacionPendientePorSalonDelColegio() {
        Colegio colegio = new Colegio();
        colegio.setId(7);
        Usuario usuario = new Usuario();
        usuario.setId(12);
        usuario.setColegio(colegio);

        Salon salonUno = salon(1, colegio);
        Salon salonDos = salon(2, colegio);

        when(usuarioRepository.findById(12)).thenReturn(Optional.of(usuario));
        when(emergenciaRepository.existsByColegioIdAndEstado(7, EstadoEmergencia.ACTIVA)).thenReturn(false);
        when(emergenciaRepository.save(any(Emergencia.class))).thenAnswer(invocacion -> {
            Emergencia emergencia = invocacion.getArgument(0);
            emergencia.setId(42);
            return emergencia;
        });
        when(salonRepository.findByColegioId(7)).thenReturn(List.of(salonUno, salonDos));

        EmergenciaResponse respuesta = emergenciaService.activarEmergencia(
                solicitud("SISMO"), new UsuarioAutenticado(12, "director@test.com", Rol.DIRECTOR));

        ArgumentCaptor<Emergencia> emergenciaCaptor = ArgumentCaptor.forClass(Emergencia.class);
        verify(emergenciaRepository).save(emergenciaCaptor.capture());
        Emergencia emergencia = emergenciaCaptor.getValue();
        assertEquals(colegio, emergencia.getColegio());
        assertEquals(usuario, emergencia.getActivadaPor());
        assertEquals(TipoEmergencia.SISMO, emergencia.getTipo());
        assertEquals(EstadoEmergencia.ACTIVA, emergencia.getEstado());
        assertNotNull(emergencia.getActivadaEn());
        assertEquals(42, respuesta.id());

        ArgumentCaptor<ConfirmacionSalon> confirmacionCaptor =
                ArgumentCaptor.forClass(ConfirmacionSalon.class);
        verify(confirmacionSalonRepository, org.mockito.Mockito.times(2))
                .save(confirmacionCaptor.capture());
        assertEquals(List.of(emergencia, emergencia),
                confirmacionCaptor.getAllValues().stream().map(ConfirmacionSalon::getEmergencia).toList());
        assertEquals(List.of(salonUno, salonDos),
                confirmacionCaptor.getAllValues().stream().map(ConfirmacionSalon::getSalon).toList());
        assertEquals(List.of(EstadoConfirmacion.PENDIENTE, EstadoConfirmacion.PENDIENTE),
                confirmacionCaptor.getAllValues().stream().map(ConfirmacionSalon::getEstado).toList());
    }

    @Test
    void activarEmergenciaRechazaRolNoPermitido() {
        assertThrows(AccesoNoAutorizadoException.class, () -> emergenciaService.activarEmergencia(
                solicitud("SISMO"), new UsuarioAutenticado(12, "padre@test.com", Rol.PADRE)));

        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void activarEmergenciaRechazaOtraEmergenciaActivaEnElMismoColegio() {
        Colegio colegio = new Colegio();
        colegio.setId(7);
        Usuario usuario = new Usuario();
        usuario.setId(12);
        usuario.setColegio(colegio);
        when(usuarioRepository.findById(12)).thenReturn(Optional.of(usuario));
        when(emergenciaRepository.existsByColegioIdAndEstado(7, EstadoEmergencia.ACTIVA)).thenReturn(true);

        assertThrows(ConflictoException.class, () -> emergenciaService.activarEmergencia(
                solicitud("SISMO"), new UsuarioAutenticado(12, "docente@test.com", Rol.DOCENTE)));

        verify(emergenciaRepository, never()).save(any(Emergencia.class));
        verify(salonRepository, never()).findByColegioId(7);
    }

    @Test
    void activarEmergenciaSoloAceptaSismo() {
        assertThrows(IllegalArgumentException.class, () -> emergenciaService.activarEmergencia(
                solicitud("INCENDIO"), new UsuarioAutenticado(12, "docente@test.com", Rol.DOCENTE)));

        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void obtenerEmergenciaActivaBuscaLaEmergenciaDelColegioDelUsuarioAutenticado() {
        Colegio colegio = new Colegio();
        colegio.setId(7);
        Usuario usuario = new Usuario();
        usuario.setId(12);
        usuario.setColegio(colegio);
        Emergencia emergencia = new Emergencia();
        emergencia.setId(42);
        emergencia.setColegio(colegio);
        emergencia.setTipo(TipoEmergencia.SISMO);
        emergencia.setEstado(EstadoEmergencia.ACTIVA);

        when(usuarioRepository.findById(12)).thenReturn(Optional.of(usuario));
        when(emergenciaRepository.findByColegioIdAndEstado(7, EstadoEmergencia.ACTIVA))
                .thenReturn(Optional.of(emergencia));

        EmergenciaResponse respuesta = emergenciaService.obtenerEmergenciaActiva(
                new UsuarioAutenticado(12, "padre@test.com", Rol.PADRE));

        assertEquals(42, respuesta.id());
        verify(emergenciaRepository).findByColegioIdAndEstado(7, EstadoEmergencia.ACTIVA);
    }

    @Test
    void obtenerEmergenciaActivaInformaCuandoElColegioNoTieneEmergenciasActivas() {
        Colegio colegio = new Colegio();
        colegio.setId(7);
        Usuario usuario = new Usuario();
        usuario.setId(12);
        usuario.setColegio(colegio);
        when(usuarioRepository.findById(12)).thenReturn(Optional.of(usuario));
        when(emergenciaRepository.findByColegioIdAndEstado(7, EstadoEmergencia.ACTIVA))
                .thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> emergenciaService.obtenerEmergenciaActiva(
                new UsuarioAutenticado(12, "padre@test.com", Rol.PADRE)));
    }

    private Salon salon(int id, Colegio colegio) {
        Salon salon = new Salon();
        salon.setId(id);
        salon.setColegio(colegio);
        salon.setNombre("Salón " + id);
        return salon;
    }

    private ActivarEmergenciaRequest solicitud(String tipo) {
        ActivarEmergenciaRequest request = new ActivarEmergenciaRequest();
        request.setTipo(tipo);
        return request;
    }
}
