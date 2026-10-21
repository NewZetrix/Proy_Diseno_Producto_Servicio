package com.safeschool.backend.controller;

import com.safeschool.backend.dto.ConfirmacionResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.ConfirmacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emergencias")
@RequiredArgsConstructor
public class ConfirmacionController {

    private final ConfirmacionService confirmacionService;

    @PutMapping("/{id}/salones/{salonId}/confirmacion")
    public ConfirmacionResponse confirmar(
            @PathVariable("id") Long emergenciaId,
            @PathVariable("salonId") Long salonId,
            @AuthenticationPrincipal UsuarioAutenticado usuario
    ) {
        return confirmacionService.confirmar(emergenciaId, salonId, usuario);
    }
}