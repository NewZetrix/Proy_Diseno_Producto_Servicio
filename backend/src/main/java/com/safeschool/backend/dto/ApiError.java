package com.safeschool.backend.dto;

import java.time.LocalDateTime;

public record ApiError(int estado, String error, String mensaje,LocalDateTime fecha) {
    
}
