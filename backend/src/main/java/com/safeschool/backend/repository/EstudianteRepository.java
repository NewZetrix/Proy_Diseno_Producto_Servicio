package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Estudiante;

public interface EstudianteRepository extends JpaRepository<Estudiante, Integer> {
    
}
