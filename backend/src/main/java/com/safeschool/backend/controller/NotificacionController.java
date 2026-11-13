package com.safeschool.backend.controller;

import com.safeschool.backend.dto.NotificacionResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/notificaciones")
    @PreAuthorize("hasRole('PADRE')")
    public ResponseEntity<List<NotificacionResponse>> obtenerNotificaciones(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(notificacionService.obtenerNotificacionesPorPadre(usuario.id()));
    }
}