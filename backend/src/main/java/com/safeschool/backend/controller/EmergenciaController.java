package com.safeschool.backend.controller;

import com.safeschool.backend.dto.ActivarEmergenciaRequest;
import com.safeschool.backend.dto.EmergenciaResponse;
import com.safeschool.backend.dto.ResumenSalonesResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.EmergenciaService;
import jakarta.validation.Valid;
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

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'DOCENTE')")
    public ResponseEntity<EmergenciaResponse> activarEmergencia(@Valid @RequestBody ActivarEmergenciaRequest request) {
        EmergenciaResponse response = emergenciaService.activarEmergencia(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/activa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmergenciaResponse> obtenerEmergenciaActiva() {
        EmergenciaResponse response = emergenciaService.obtenerEmergenciaActiva();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/salones")
    @PreAuthorize("hasRole('DIRECTOR')")
    public ResponseEntity<ResumenSalonesResponse> obtenerSalonesEmergencia(
            @PathVariable("id") Long emergenciaId,
            @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        ResumenSalonesResponse resumen = emergenciaService.obtenerResumenSalones(emergenciaId, usuario);
        return ResponseEntity.ok(resumen);
    }
}