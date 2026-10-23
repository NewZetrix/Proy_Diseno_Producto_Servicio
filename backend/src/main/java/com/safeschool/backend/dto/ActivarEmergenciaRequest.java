package com.safeschool.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ActivarEmergenciaRequest {

    @NotBlank(message = "El tipo de emergencia es obligatorio")
    private String tipo;

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}