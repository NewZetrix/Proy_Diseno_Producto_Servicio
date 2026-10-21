package com.safeschool.backend.dto;

import com.safeschool.backend.model.Rol;

public record LoginResponse(String token, String tipo, Integer id, String nombre, Rol rol) {
}