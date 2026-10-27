package com.safeschool.backend.repository;

import com.safeschool.backend.model.Dispositivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DispositivoRepository extends JpaRepository<Dispositivo, Long> {

    Optional<Dispositivo> findByTokenFcm(String tokenFcm);

    List<Dispositivo> findByUsuario_Id(Integer usuarioId);
}
