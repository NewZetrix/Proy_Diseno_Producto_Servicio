package com.safeschool.backend.service;

import com.safeschool.backend.dto.LoginRequest;
import com.safeschool.backend.dto.LoginResponse;
import com.safeschool.backend.exception.CredencialesInvalidasException;
import com.safeschool.backend.model.Rol;
import com.safeschool.backend.model.Usuario;
import com.safeschool.backend.repository.UsuarioRepository;
import com.safeschool.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService =
            new JwtService("clave-de-prueba-con-mas-de-32-caracteres-123", 5);

    private AuthService authService;

    @BeforeEach
    void preparar() {
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService);
    }

    private Usuario lucia() {
        Usuario u = new Usuario();
        u.setId(2);
        u.setNombre("Lucía Torres");
        u.setCorreo("lucia@safeschool.test");
        u.setPasswordHash(passwordEncoder.encode("SafeSchool2026"));
        u.setRol(Rol.DOCENTE);
        return u;
    }

    @Test
    void loginCorrectoDevuelveTokenValidoYRol() {
        when(usuarioRepository.findByCorreo("lucia@safeschool.test")).thenReturn(Optional.of(lucia()));

        LoginResponse respuesta =
                authService.login(new LoginRequest("lucia@safeschool.test", "SafeSchool2026"));

        assertEquals(Rol.DOCENTE, respuesta.rol());
        assertTrue(jwtService.validar(respuesta.token()).isPresent());
    }

    @Test
    void contrasenaIncorrectaLanzaCredencialesInvalidas() {
        when(usuarioRepository.findByCorreo("lucia@safeschool.test")).thenReturn(Optional.of(lucia()));

        assertThrows(CredencialesInvalidasException.class,
                () -> authService.login(new LoginRequest("lucia@safeschool.test", "mala")));
    }

    @Test
    void correoInexistenteLanzaCredencialesInvalidas() {
        when(usuarioRepository.findByCorreo("nadie@safeschool.test")).thenReturn(Optional.empty());

        assertThrows(CredencialesInvalidasException.class,
                () -> authService.login(new LoginRequest("nadie@safeschool.test", "SafeSchool2026")));
    }
}