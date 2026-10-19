package com.safeschool.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.safeschool.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
}
