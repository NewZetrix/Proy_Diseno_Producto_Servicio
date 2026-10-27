package com.safeschool.backend.repository;

import com.safeschool.backend.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstudianteRepository extends JpaRepository<Estudiante, Integer> {

    List<Estudiante> findBySalonId(Integer salonId);
}