package com.safeschool.backend.service;

import com.safeschool.backend.dto.ActivarEmergenciaRequest;
import com.safeschool.backend.dto.EmergenciaResponse;
import com.safeschool.backend.dto.ResumenSalonesResponse;
import com.safeschool.backend.dto.SalonEstadoDto;
import com.safeschool.backend.exception.AccesoNoAutorizadoException;
import com.safeschool.backend.exception.ConflictoException;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.ConfirmacionSalonRepository;
import com.safeschool.backend.repository.EmergenciaRepository;
import com.safeschool.backend.repository.SalonRepository;
import com.safeschool.backend.repository.UsuarioRepository;
import com.safeschool.backend.security.UsuarioAutenticado;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmergenciaService {

    private final EmergenciaRepository emergenciaRepository;
    private final SalonRepository salonRepository;
    private final ConfirmacionSalonRepository confirmacionSalonRepository;
    private final UsuarioRepository usuarioRepository;

    public EmergenciaService(EmergenciaRepository emergenciaRepository,
                             SalonRepository salonRepository,
                             ConfirmacionSalonRepository confirmacionSalonRepository,
                             UsuarioRepository usuarioRepository) {
        this.emergenciaRepository = emergenciaRepository;
        this.salonRepository = salonRepository;
        this.confirmacionSalonRepository = confirmacionSalonRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public EmergenciaResponse activarEmergencia(ActivarEmergenciaRequest request, UsuarioAutenticado usuarioAuth) {
        if (usuarioAuth.rol() != Rol.DIRECTOR && usuarioAuth.rol() != Rol.DOCENTE) {
            throw new AccesoNoAutorizadoException("Solo un director o docente puede activar una emergencia.");
        }

        if (!"SISMO".equalsIgnoreCase(request.getTipo())) {
            throw new IllegalArgumentException("Tipo de emergencia no soportado para el PMV1.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioAuth.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Colegio colegio = usuario.getColegio();

        if (emergenciaRepository.existsByColegioIdAndEstado(colegio.getId(), EstadoEmergencia.ACTIVA)) {
            throw new ConflictoException("Ya existe una emergencia activa en este colegio.");
        }

        Emergencia emergencia = new Emergencia();
        emergencia.setColegio(colegio);
        emergencia.setActivadaPor(usuario);
        emergencia.setTipo(TipoEmergencia.SISMO);
        emergencia.setEstado(EstadoEmergencia.ACTIVA);
        emergencia.setActivadaEn(LocalDateTime.now());

        Emergencia savedEmergencia = emergenciaRepository.save(emergencia);

        List<Salon> salones = salonRepository.findByColegioId(colegio.getId());
        for (Salon salon : salones) {
            ConfirmacionSalon confirmacion = new ConfirmacionSalon();
            confirmacion.setEmergencia(savedEmergencia);
            confirmacion.setSalon(salon);
            confirmacion.setEstado(EstadoConfirmacion.PENDIENTE);
            confirmacionSalonRepository.save(confirmacion);
        }

        return mapToResponse(savedEmergencia);
    }

    public EmergenciaResponse obtenerEmergenciaActiva(UsuarioAutenticado usuarioAuth) {
        Usuario usuario = usuarioRepository.findById(usuarioAuth.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Emergencia emergencia = emergenciaRepository.findByColegioIdAndEstado(
                        usuario.getColegio().getId(), EstadoEmergencia.ACTIVA)
                .orElseThrow(() -> new RecursoNoEncontradoException("No hay ninguna emergencia activa en este momento."));
        return mapToResponse(emergencia);
    }

    public ResumenSalonesResponse obtenerResumenSalones(Long emergenciaId, UsuarioAutenticado usuario) {
        Emergencia emergencia = emergenciaRepository.findById(emergenciaId.intValue())
                .orElseThrow(() -> new RecursoNoEncontradoException("Emergencia no encontrada"));

        List<ConfirmacionSalon> confirmaciones = confirmacionSalonRepository.findByEmergenciaId(emergenciaId);

        List<SalonEstadoDto> listaSalones = confirmaciones.stream().map(c -> new SalonEstadoDto(
                c.getSalon().getId().longValue(),
                c.getSalon().getNombre(),
                c.getEstado().name(),
                c.getConfirmadoEn(),
                c.getSalon().getDocente() != null ? c.getSalon().getDocente().getNombre() : "Sin asignar"
        )).toList();

        int total = listaSalones.size();
        int confirmados = (int) listaSalones.stream().filter(s -> "A_SALVO".equals(s.getEstado())).count();
        int pendientes = total - confirmados;

        return new ResumenSalonesResponse(
                emergencia.getId().longValue(),
                emergencia.getTipo(),
                total,
                confirmados,
                pendientes,
                listaSalones
        );
    }

    private EmergenciaResponse mapToResponse(Emergencia emergencia) {
        return new EmergenciaResponse(
            emergencia.getId(),
            emergencia.getTipo(),
            emergencia.getEstado(),
            emergencia.getActivadaEn(),
            List.of("Conserve la calma", "Ubíquese en las zonas seguras", "Siga las instrucciones del brigadista")
        );
    }
}