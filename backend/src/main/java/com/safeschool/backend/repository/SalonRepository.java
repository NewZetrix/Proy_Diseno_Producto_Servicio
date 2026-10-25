package com.safeschool.backend.repository;

import com.safeschool.backend.model.Salon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalonRepository extends JpaRepository<Salon, Integer> {

    List<Salon> findByColegioId(Integer colegioId);

    List<Salon> findByDocenteId(Integer docenteId);
}