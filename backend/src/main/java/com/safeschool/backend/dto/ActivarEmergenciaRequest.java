package com.safeschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ActivarEmergenciaRequest {

    @NotBlank(message = "El tipo de emergencia es obligatorio")
    @Pattern(regexp = "(?i)^SISMO$", message = "El tipo de emergencia no está soportado para el PMV1")
    private String tipo;

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}