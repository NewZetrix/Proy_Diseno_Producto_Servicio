package com.safeschool.backend.repository;

import com.safeschool.backend.model.Emergencia;
import com.safeschool.backend.model.EstadoEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmergenciaRepository extends JpaRepository<Emergencia, Integer> {
    boolean existsByEstado(EstadoEmergencia estado);
    boolean existsByColegioIdAndEstado(Integer colegioId, EstadoEmergencia estado);
    Optional<Emergencia> findByEstado(EstadoEmergencia estado);
    Optional<Emergencia> findByColegioIdAndEstado(Integer colegioId, EstadoEmergencia estado);
}