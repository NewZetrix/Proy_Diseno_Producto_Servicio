package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Emergencia;

public interface EmergenciaRepository extends JpaRepository<Emergencia, Integer> {
    
}
