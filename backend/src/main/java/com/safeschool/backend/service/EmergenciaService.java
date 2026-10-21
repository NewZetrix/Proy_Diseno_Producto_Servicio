package com.safeschool.backend.service;

import com.safeschool.backend.dto.ActivarEmergenciaRequest;
import com.safeschool.backend.dto.EmergenciaResponse;
import com.safeschool.backend.exception.ConflictoException;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.ConfirmacionSalonRepository;
import com.safeschool.backend.repository.EmergenciaRepository;
import com.safeschool.backend.repository.SalonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmergenciaService {

    private final EmergenciaRepository emergenciaRepository;
    private final SalonRepository salonRepository;
    private final ConfirmacionSalonRepository confirmacionSalonRepository;

    public EmergenciaService(EmergenciaRepository emergenciaRepository,
                             SalonRepository salonRepository,
                             ConfirmacionSalonRepository confirmacionSalonRepository) {
        this.emergenciaRepository = emergenciaRepository;
        this.salonRepository = salonRepository;
        this.confirmacionSalonRepository = confirmacionSalonRepository;
    }

    @Transactional
    public EmergenciaResponse activarEmergencia(ActivarEmergenciaRequest request) {
        boolean existeActiva = emergenciaRepository.existsByEstado(EstadoEmergencia.ACTIVA);
        if (existeActiva) {
            throw new ConflictoException("Ya existe una emergencia activa en el sistema.");
        }

        if (!"SISMO".equalsIgnoreCase(request.getTipo())) {
            throw new IllegalArgumentException("Tipo de emergencia no soportado para el PMV1.");
        }

        Emergencia emergencia = new Emergencia();
        emergencia.setTipo(TipoEmergencia.SISMO);
        emergencia.setEstado(EstadoEmergencia.ACTIVA);
        emergencia.setFechaHoraInicio(LocalDateTime.now());
        emergencia.setProtocolo("Conserve la calma, evite el pánico, ubíquese en las zonas seguras y siga las instrucciones del brigadista.");

        Emergencia savedEmergencia = emergenciaRepository.save(emergencia);

        List<Salon> salones = salonRepository.findAll();
        for (Salon salon : salones) {
            ConfirmacionSalon confirmacion = new ConfirmacionSalon();
            confirmacion.setEmergencia(savedEmergencia);
            confirmacion.setSalon(salon);
            confirmacion.setEstado(EstadoConfirmacion.PENDIENTE);
            confirmacionSalonRepository.save(confirmacion);
        }

        return mapToResponse(savedEmergencia);
    }

    public EmergenciaResponse obtenerEmergenciaActiva() {
        Emergencia emergencia = emergenciaRepository.findByEstado(EstadoEmergencia.ACTIVA)
                .orElseThrow(() -> new RecursoNoEncontradoException("No hay ninguna emergencia activa en este momento."));
        return mapToResponse(emergencia);
    }

    private EmergenciaResponse mapToResponse(Emergencia emergencia) {
        EmergenciaResponse res = new EmergenciaResponse();
        res.setId(emergencia.getId());
        res.setTipo(emergencia.getTipo() != null ? emergencia.getTipo().name() : "SISMO");
        res.setEstado(emergencia.getEstado() != null ? emergencia.getEstado().name() : "ACTIVA");
        res.setFechaHoraInicio(emergencia.getFechaHoraInicio() != null ? emergencia.getFechaHoraInicio().toString() : "");
        res.setProtocolo(emergencia.getProtocolo());
        return res;
    }
}