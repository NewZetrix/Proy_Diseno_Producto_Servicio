package com.safeschool.backend.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        String mensaje,
        String estado,
        LocalDateTime fechaCreacion
) {}