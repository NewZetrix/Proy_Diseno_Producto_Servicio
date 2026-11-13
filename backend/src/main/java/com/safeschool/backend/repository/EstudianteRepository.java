package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Estudiante;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface EstudianteRepository extends JpaRepository<Estudiante, Integer> {

    @EntityGraph(attributePaths = "apoderado")
    List<Estudiante> findBySalon_Id(Integer salonId);
}
