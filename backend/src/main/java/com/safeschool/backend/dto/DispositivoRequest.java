package com.safeschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositivoRequest {

    @NotBlank(message = "El token FCM es obligatorio")
    private String tokenFcm;
}