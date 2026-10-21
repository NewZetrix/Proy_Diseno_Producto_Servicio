package com.safeschool.backend.repository;

import com.safeschool.backend.model.Emergencia;
import com.safeschool.backend.model.EstadoEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmergenciaRepository extends JpaRepository<Emergencia, Long> {
    boolean existsByEstado(EstadoEmergencia estado);
    Optional<Emergencia> findByEstado(EstadoEmergencia estado);
}