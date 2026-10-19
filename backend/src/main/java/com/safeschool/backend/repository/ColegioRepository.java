package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Colegio;

public interface ColegioRepository extends JpaRepository<Colegio, Integer> {
    
}
