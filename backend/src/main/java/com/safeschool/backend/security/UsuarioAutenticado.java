package com.safeschool.backend.security;

import com.safeschool.backend.model.Rol;

public record UsuarioAutenticado(Integer id, String correo, Rol rol) {
}