package com.safeschool.backend.dto;

import java.time.LocalDateTime;

public record MensajeChatResponse(
        Long id,
        String texto,
        String nombreRemitente,
        String rolRemitente,
        LocalDateTime enviadoEn
) {}