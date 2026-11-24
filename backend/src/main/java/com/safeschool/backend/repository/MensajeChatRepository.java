package com.safeschool.backend.repository;

import com.safeschool.backend.model.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {

    List<MensajeChat> findByEmergencia_IdOrderByEnviadoEnAsc(Integer emergenciaId);
}