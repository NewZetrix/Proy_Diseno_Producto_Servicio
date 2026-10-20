package com.safeschool.backend.security;

import com.safeschool.backend.model.Rol;
import com.safeschool.backend.model.Usuario;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String CLAVE = "clave-de-prueba-con-mas-de-32-caracteres-123";

    private final JwtService jwtService = new JwtService(CLAVE, 5);

    private Usuario usuario(Rol rol) {
        Usuario u = new Usuario();
        u.setId(7);
        u.setCorreo("lucia@safeschool.test");
        u.setRol(rol);
        return u;
    }

    @Test
    void tokenGeneradoSeValidaYConservaIdYRol() {
        String token = jwtService.generar(usuario(Rol.DOCENTE));

        Optional<UsuarioAutenticado> resultado = jwtService.validar(token);

        assertTrue(resultado.isPresent());
        assertEquals(7, resultado.get().id());
        assertEquals(Rol.DOCENTE, resultado.get().rol());
    }

    @Test
    void tokenAlteradoNoEsValido() {
        String token = jwtService.generar(usuario(Rol.DIRECTOR));

        assertTrue(jwtService.validar(token + "x").isEmpty());
    }

    @Test
    void tokenFirmadoConOtraClaveNoEsValido() {
        JwtService otro = new JwtService("otra-clave-distinta-con-mas-de-32-caracteres", 5);

        assertTrue(jwtService.validar(otro.generar(usuario(Rol.PADRE))).isEmpty());
    }

    @Test
    void tokenVencidoNoEsValido() {
        JwtService conVencimientoPasado = new JwtService(CLAVE, -1);

        assertTrue(jwtService.validar(conVencimientoPasado.generar(usuario(Rol.DOCENTE))).isEmpty());
    }
}