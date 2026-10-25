package com.safeschool.backend.service;

import com.safeschool.backend.dto.ConfirmacionResponse;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConfirmacionServiceTest {

    @Mock
    private EmergenciaRepository emergenciaRepository;

    @Mock
    private SalonRepository salonRepository;

    @Mock
    private ConfirmacionSalonRepository confirmacionSalonRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private ConfirmacionService confirmacionService;

    @BeforeEach
    void preparar() {
        confirmacionService = new ConfirmacionService(
                emergenciaRepository, salonRepository, confirmacionSalonRepository, usuarioRepository);
    }

    @Test
    void confirmarMarcaElSalonASalvoYDevuelveElConteoActualizado() {
        Emergencia emergencia = emergenciaActiva();
        Usuario docente = docente(3);
        Salon salon = salon(2, docente, emergencia.getColegio());
        ConfirmacionSalon confirmacion = confirmacion(9L, emergencia, salon, EstadoConfirmacion.PENDIENTE);

        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));
        when(salonRepository.findById(2)).thenReturn(Optional.of(salon));
        when(confirmacionSalonRepository.findByEmergenciaIdAndSalonId(1L, 2L))
                .thenReturn(Optional.of(confirmacion));
        when(usuarioRepository.findById(3)).thenReturn(Optional.of(docente));
        when(confirmacionSalonRepository.countByEmergenciaIdAndEstado(1L, EstadoConfirmacion.A_SALVO))
                .thenReturn(1L);
        when(confirmacionSalonRepository.countByEmergenciaId(1L)).thenReturn(4L);

        ConfirmacionResponse respuesta = confirmacionService.confirmar(
                1L, 2L, new UsuarioAutenticado(3, "docente@test.com", Rol.DOCENTE));

        assertEquals(EstadoConfirmacion.A_SALVO, confirmacion.getEstado());
        assertEquals(docente, confirmacion.getConfirmadoPor());
        assertNotNull(confirmacion.getConfirmadoEn());
        assertEquals("A_SALVO", respuesta.getEstado());
        assertEquals(1L, respuesta.getSalonesConfirmados());
        assertEquals(4L, respuesta.getTotalSalones());
        verify(confirmacionSalonRepository).save(confirmacion);
    }

    @Test
    void confirmarEmergenciaInactivaDevuelveConflicto() {
        Emergencia emergencia = emergenciaActiva();
        emergencia.setEstado(EstadoEmergencia.FINALIZADA);
        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));

        assertThrows(ConflictoException.class, () -> confirmacionService.confirmar(
                1L, 2L, new UsuarioAutenticado(3, "docente@test.com", Rol.DOCENTE)));

        verify(salonRepository, never()).findById(2);
        verify(confirmacionSalonRepository, never()).save(any(ConfirmacionSalon.class));
    }

    @Test
    void confirmarRechazaUsuariosQueNoSeanDocentes() {
        assertThrows(AccesoNoAutorizadoException.class, () -> confirmacionService.confirmar(
                1L, 2L, new UsuarioAutenticado(3, "director@test.com", Rol.DIRECTOR)));

        verify(emergenciaRepository, never()).findById(1);
    }

    @Test
    void confirmarSalonAsignadoAOtroDocenteDevuelveProhibido() {
        Emergencia emergencia = emergenciaActiva();
        Salon salon = salon(2, docente(4), emergencia.getColegio());
        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));
        when(salonRepository.findById(2)).thenReturn(Optional.of(salon));

        assertThrows(AccesoNoAutorizadoException.class, () -> confirmacionService.confirmar(
                1L, 2L, new UsuarioAutenticado(3, "docente@test.com", Rol.DOCENTE)));

        verify(confirmacionSalonRepository, never()).findByEmergenciaIdAndSalonId(1L, 2L);
        verify(confirmacionSalonRepository, never()).save(any(ConfirmacionSalon.class));
    }

    @Test
    void confirmarPorSegundaVezConservaLaConfirmacionSinGuardarDeNuevo() {
        Emergencia emergencia = emergenciaActiva();
        Usuario docente = docente(3);
        Salon salon = salon(2, docente, emergencia.getColegio());
        ConfirmacionSalon confirmacion = confirmacion(9L, emergencia, salon, EstadoConfirmacion.A_SALVO);
        LocalDateTime horaOriginal = LocalDateTime.of(2026, 1, 2, 10, 30);
        confirmacion.setConfirmadoEn(horaOriginal);
        confirmacion.setConfirmadoPor(docente);

        when(emergenciaRepository.findById(1)).thenReturn(Optional.of(emergencia));
        when(salonRepository.findById(2)).thenReturn(Optional.of(salon));
        when(confirmacionSalonRepository.findByEmergenciaIdAndSalonId(1L, 2L))
                .thenReturn(Optional.of(confirmacion));
        when(confirmacionSalonRepository.countByEmergenciaIdAndEstado(1L, EstadoConfirmacion.A_SALVO))
                .thenReturn(1L);
        when(confirmacionSalonRepository.countByEmergenciaId(1L)).thenReturn(4L);

        ConfirmacionResponse respuesta = confirmacionService.confirmar(
                1L, 2L, new UsuarioAutenticado(3, "docente@test.com", Rol.DOCENTE));

        assertEquals(horaOriginal.toString(), respuesta.getFechaHoraConfirmacion());
        assertEquals(docente, confirmacion.getConfirmadoPor());
        verify(confirmacionSalonRepository, never()).save(any(ConfirmacionSalon.class));
        verify(confirmacionSalonRepository).findByEmergenciaIdAndSalonId(1L, 2L);
    }

    private Emergencia emergenciaActiva() {
        Colegio colegio = new Colegio();
        colegio.setId(7);
        Emergencia emergencia = new Emergencia();
        emergencia.setId(1);
        emergencia.setColegio(colegio);
        emergencia.setEstado(EstadoEmergencia.ACTIVA);
        return emergencia;
    }

    private Usuario docente(int id) {
        Usuario docente = new Usuario();
        docente.setId(id);
        docente.setRol(Rol.DOCENTE);
        return docente;
    }

    private Salon salon(int id, Usuario docente, Colegio colegio) {
        Salon salon = new Salon();
        salon.setId(id);
        salon.setNombre("Aula " + id);
        salon.setColegio(colegio);
        salon.setDocente(docente);
        return salon;
    }

    private ConfirmacionSalon confirmacion(
            long id, Emergencia emergencia, Salon salon, EstadoConfirmacion estado) {
        ConfirmacionSalon confirmacion = new ConfirmacionSalon();
        confirmacion.setId(id);
        confirmacion.setEmergencia(emergencia);
        confirmacion.setSalon(salon);
        confirmacion.setEstado(estado);
        return confirmacion;
    }
}
