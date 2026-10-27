package com.safeschool.backend.controller;

import com.safeschool.backend.dto.DispositivoRequest;
import com.safeschool.backend.dto.NotificacionResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @PostMapping("/dispositivos")
    @PreAuthorize("hasRole('PADRE')")
    public ResponseEntity<?> registrarDispositivo(
            @Valid @RequestBody DispositivoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        notificacionService.registrarTokenDispositivo((long) usuario.id(), request.getTokenFcm());
        return ResponseEntity.status(201).body(Map.of("mensaje", "Dispositivo registrado correctamente"));
    }

    @GetMapping("/notificaciones")
    @PreAuthorize("hasRole('PADRE')")
    public ResponseEntity<List<NotificacionResponse>> obtenerNotificaciones(
            @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        return ResponseEntity.ok(
                notificacionService.obtenerNotificacionesPorPadre((long) usuario.id())
        );
    }
}