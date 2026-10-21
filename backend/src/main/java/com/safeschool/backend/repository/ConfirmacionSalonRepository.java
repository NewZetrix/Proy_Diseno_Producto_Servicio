package com.safeschool.backend.repository;

import com.safeschool.backend.model.ConfirmacionSalon;
import com.safeschool.backend.model.EstadoConfirmacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfirmacionSalonRepository extends JpaRepository<ConfirmacionSalon, Long> {
    Optional<ConfirmacionSalon> findByEmergenciaIdAndSalonId(Long emergenciaId, Long salonId);
    long countByEmergenciaIdAndEstado(Long emergenciaId, EstadoConfirmacion estado);
    long countByEmergenciaId(Long emergenciaId);
}