package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    
}
