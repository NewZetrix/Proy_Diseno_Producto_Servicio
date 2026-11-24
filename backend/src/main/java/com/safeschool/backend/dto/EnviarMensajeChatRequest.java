package com.safeschool.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EnviarMensajeChatRequest {

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Size(max = 250, message = "El mensaje no puede superar 250 caracteres")
    private String texto;

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }
}