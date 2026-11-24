package com.safeschool.backend.controller;

import com.safeschool.backend.dto.EnviarMensajeChatRequest;
import com.safeschool.backend.dto.MensajeChatResponse;
import com.safeschool.backend.security.UsuarioAutenticado;
import com.safeschool.backend.service.ChatOperativoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergencias/{emergenciaId}/chat")
public class ChatOperativoController {

    private final ChatOperativoService chatOperativoService;

    public ChatOperativoController(ChatOperativoService chatOperativoService) {
        this.chatOperativoService = chatOperativoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'DOCENTE')")
    public ResponseEntity<List<MensajeChatResponse>> listar(
            @PathVariable Long emergenciaId,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.ok(chatOperativoService.listarMensajes(emergenciaId, usuario));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR', 'DOCENTE')")
    public ResponseEntity<MensajeChatResponse> enviar(
            @PathVariable Long emergenciaId,
            @Valid @RequestBody EnviarMensajeChatRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        MensajeChatResponse creado = chatOperativoService.enviarMensaje(emergenciaId, request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
}