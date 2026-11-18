package com.safeschool.backend.controller;

import com.safeschool.backend.service.ProtocoloInstruccionesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/protocolos")
public class ProtocoloController {

    private final ProtocoloInstruccionesService protocoloInstruccionesService;

    public ProtocoloController(ProtocoloInstruccionesService protocoloInstruccionesService) {
        this.protocoloInstruccionesService = protocoloInstruccionesService;
    }

    @GetMapping("/{tipo}/instrucciones")
    @PreAuthorize("hasAnyRole('DIRECTOR', 'DOCENTE')")
    public ResponseEntity<Map<String, Object>> obtenerInstrucciones(@PathVariable String tipo) {
        List<String> pasos = protocoloInstruccionesService.obtenerPorNombre(tipo);
        return ResponseEntity.ok(Map.of(
                "tipo", tipo.trim().toUpperCase(),
                "instrucciones", pasos
        ));
    }
}