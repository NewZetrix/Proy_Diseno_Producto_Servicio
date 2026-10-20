package com.safeschool.backend.service;

import com.safeschool.backend.dto.LoginRequest;
import com.safeschool.backend.dto.LoginResponse;
import com.safeschool.backend.exception.CredencialesInvalidasException;
import com.safeschool.backend.model.Usuario;
import com.safeschool.backend.repository.UsuarioRepository;
import com.safeschool.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest solicitud) {
        Usuario usuario = usuarioRepository.findByCorreo(solicitud.correo())
                .filter(u -> passwordEncoder.matches(solicitud.password(), u.getPasswordHash()))
                .orElseThrow(() -> new CredencialesInvalidasException("Correo o contraseña incorrectos"));
        String token = jwtService.generar(usuario);
        return new LoginResponse(token, "Bearer", usuario.getId(), usuario.getNombre(), usuario.getRol());
    }
}