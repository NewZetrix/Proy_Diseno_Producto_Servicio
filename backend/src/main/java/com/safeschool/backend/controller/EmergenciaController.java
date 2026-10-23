package com.safeschool.backend.controller;

import com.safeschool.backend.dto.ResumenSalonesResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.EmergenciaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emergencias")
public class EmergenciaController {

    private final EmergenciaService emergenciaService;

    public EmergenciaController(EmergenciaService emergenciaService) {
        this.emergenciaService = emergenciaService;
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
}