package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Salon;

public interface SalonRepository extends JpaRepository<Salon, Integer> {
    
}
