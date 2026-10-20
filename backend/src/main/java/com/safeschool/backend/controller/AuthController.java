package com.safeschool.backend.controller;

import com.safeschool.backend.dto.LoginRequest;
import com.safeschool.backend.dto.LoginResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest solicitud) {
        return authService.login(solicitud);
    }

    @GetMapping("/yo")
    public UsuarioAutenticado yo(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return usuario;
    }
}

/*

git add (lo que se avanzo xd)
git commit -m "feat: login con BCrypt"

*/