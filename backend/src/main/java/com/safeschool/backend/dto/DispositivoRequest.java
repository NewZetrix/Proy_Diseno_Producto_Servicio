package com.safeschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispositivoRequest {

    @NotBlank(message = "El token FCM es obligatorio")
    @Size(max = 512, message = "El token FCM no debe superar 512 caracteres")
    private String tokenFcm;
}