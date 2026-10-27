package com.safeschool.backend.controller;

import com.safeschool.backend.dto.ActivarEmergenciaRequest;
import com.safeschool.backend.dto.EmergenciaResponse;
import com.safeschool.backend.dto.ResumenSalonesResponse;
import com.safeschool.backend.dto.SalonEstadoDto;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.EmergenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergencias")
public class EmergenciaController {

    private final EmergenciaService emergenciaService;

    public EmergenciaController(EmergenciaService emergenciaService) {
        this.emergenciaService = emergenciaService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'DOCENTE')")
    public ResponseEntity<EmergenciaResponse> activarEmergencia(
            @Valid @RequestBody ActivarEmergenciaRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(emergenciaService.activarEmergencia(request, usuario));
    }

    @GetMapping("/activa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmergenciaResponse> obtenerEmergenciaActiva(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(emergenciaService.obtenerEmergenciaActiva(usuario));
    }

    @PutMapping("/{id}/finalizar")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<EmergenciaResponse> finalizarEmergencia(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(emergenciaService.finalizarEmergencia(id, usuario));
    }

    // Endpoint HU04: Lista de salones y resumen para el Director[cite: 11]
    @GetMapping("/{id}/salones")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<ResumenSalonesResponse> obtenerResumenSalones(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        ResumenSalonesResponse resumen = emergenciaService.obtenerResumenSalones(id, usuario);
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/{id}/mis-salones")
    @PreAuthorize("hasRole('DOCENTE')")
    public ResponseEntity<List<SalonEstadoDto>> obtenerSalonesDocente(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(emergenciaService.obtenerSalonesDocente(id, usuario));
    }
}