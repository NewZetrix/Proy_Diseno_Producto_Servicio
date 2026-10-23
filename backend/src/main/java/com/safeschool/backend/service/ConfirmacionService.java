package com.safeschool.backend.service;

import com.safeschool.backend.dto.ConfirmacionResponse;
import com.safeschool.backend.exception.AccesoNoAutorizadoException;
import com.safeschool.backend.exception.ConflictoException;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.*;
import com.safeschool.backend.security.UsuarioAutenticado;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ConfirmacionService {

    private final EmergenciaRepository emergenciaRepository;
    private final SalonRepository salonRepository;
    private final ConfirmacionSalonRepository confirmacionSalonRepository;
    private final UsuarioRepository usuarioRepository;

    public ConfirmacionService(EmergenciaRepository emergenciaRepository,
                               SalonRepository salonRepository,
                               ConfirmacionSalonRepository confirmacionSalonRepository,
                               UsuarioRepository usuarioRepository) {
        this.emergenciaRepository = emergenciaRepository;
        this.salonRepository = salonRepository;
        this.confirmacionSalonRepository = confirmacionSalonRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ConfirmacionResponse confirmar(Long emergenciaId, Long salonId, UsuarioAutenticado usuarioAuth) {
        if (usuarioAuth.rol() != Rol.DOCENTE) {
            throw new AccesoNoAutorizadoException("Solo un docente puede confirmar un salón");
        }

        Emergencia emergencia = emergenciaRepository.findById(emergenciaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Emergencia no encontrada"));

        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salón no encontrado"));

        if (salon.getColegio() != null && emergencia.getColegio() != null &&
            !salon.getColegio().getId().equals(emergencia.getColegio().getId())) {
            throw new RecursoNoEncontradoException("El salón no pertenece a esta emergencia");
        }

        if (salon.getDocente() != null && !salon.getDocente().getId().equals(usuarioAuth.id())) {
            throw new AccesoNoAutorizadoException("Solo puede confirmar su propio salón");
        }

        if (emergencia.getEstado() != EstadoEmergencia.ACTIVA) {
            throw new ConflictoException("La emergencia no está activa");
        }

        ConfirmacionSalon confirmacion = confirmacionSalonRepository
                .findByEmergenciaIdAndSalonId(emergenciaId, salonId)
                .orElseThrow(() -> new RecursoNoEncontradoException("El salón no tiene confirmación en esta emergencia"));

        if (confirmacion.getEstado() != EstadoConfirmacion.A_SALVO) {
            Usuario docente = usuarioRepository.findById(usuarioAuth.id())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Usuario docente no encontrado"));

            confirmacion.setEstado(EstadoConfirmacion.A_SALVO);
            confirmacion.setFechaHoraConfirmacion(LocalDateTime.now());
            confirmacion.setConfirmadoPor(docente);
            confirmacionSalonRepository.save(confirmacion);
        }

        long salonesConfirmados = confirmacionSalonRepository.countByEmergenciaIdAndEstado(emergenciaId, EstadoConfirmacion.A_SALVO);
        long totalSalones = confirmacionSalonRepository.countByEmergenciaId(emergenciaId);

        ConfirmacionResponse response = new ConfirmacionResponse();
        response.setId(confirmacion.getId());
        response.setSalonId(salon.getId());
        response.setNombreSalon(salon.getNombre());
        response.setEstado(confirmacion.getEstado().name());
        response.setFechaHoraConfirmacion(confirmacion.getFechaHoraConfirmacion() != null ? confirmacion.getFechaHoraConfirmacion().toString() : null);
        response.setSalonesConfirmados(salonesConfirmados);
        response.setTotalSalones(totalSalones);

        return response;
    }
}