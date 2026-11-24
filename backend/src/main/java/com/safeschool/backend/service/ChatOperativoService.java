package com.safeschool.backend.service;

import com.safeschool.backend.dto.EnviarMensajeChatRequest;
import com.safeschool.backend.dto.MensajeChatResponse;
import com.safeschool.backend.exception.AccesoNoAutorizadoException;
import com.safeschool.backend.exception.ConflictoException;
import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.*;
import com.safeschool.backend.repository.EmergenciaRepository;
import com.safeschool.backend.repository.MensajeChatRepository;
import com.safeschool.backend.repository.UsuarioRepository;
import com.safeschool.backend.security.UsuarioAutenticado;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatOperativoService {

    private final MensajeChatRepository mensajeChatRepository;
    private final EmergenciaRepository emergenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public ChatOperativoService(
            MensajeChatRepository mensajeChatRepository,
            EmergenciaRepository emergenciaRepository,
            UsuarioRepository usuarioRepository) {
        this.mensajeChatRepository = mensajeChatRepository;
        this.emergenciaRepository = emergenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<MensajeChatResponse> listarMensajes(Long emergenciaId, UsuarioAutenticado auth) {
        validarRolChat(auth);
        Emergencia emergencia = obtenerEmergenciaDelColegio(emergenciaId, auth);
        return mensajeChatRepository.findByEmergencia_IdOrderByEnviadoEnAsc(emergencia.getId()).stream()
                .map(this::mapear)
                .toList();
    }

    @Transactional
    public MensajeChatResponse enviarMensaje(
            Long emergenciaId,
            EnviarMensajeChatRequest request,
            UsuarioAutenticado auth) {
        validarRolChat(auth);
        Emergencia emergencia = obtenerEmergenciaDelColegio(emergenciaId, auth);

        if (emergencia.getEstado() != EstadoEmergencia.ACTIVA) {
            throw new ConflictoException("El chat solo está disponible con una emergencia activa.");
        }

        String texto = request.getTexto() == null ? "" : request.getTexto().trim();
        if (texto.isEmpty() || texto.length() > 250) {
            throw new IllegalArgumentException("El mensaje debe tener entre 1 y 250 caracteres.");
        }

        Usuario usuario = usuarioRepository.findById(auth.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        MensajeChat mensaje = new MensajeChat();
        mensaje.setEmergencia(emergencia);
        mensaje.setUsuario(usuario);
        mensaje.setTexto(texto);
        mensaje.setEnviadoEn(LocalDateTime.now());

        return mapear(mensajeChatRepository.save(mensaje));
    }

    private Emergencia obtenerEmergenciaDelColegio(Long emergenciaId, UsuarioAutenticado auth) {
        Usuario usuario = usuarioRepository.findById(auth.id())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        Emergencia emergencia = emergenciaRepository.findById(emergenciaId.intValue())
                .orElseThrow(() -> new RecursoNoEncontradoException("Emergencia no encontrada"));

        if (!emergencia.getColegio().getId().equals(usuario.getColegio().getId())) {
            throw new AccesoNoAutorizadoException("No perteneces al colegio de esta emergencia.");
        }
        return emergencia;
    }

    private void validarRolChat(UsuarioAutenticado auth) {
        if (auth.rol() != Rol.DIRECTOR && auth.rol() != Rol.DOCENTE) {
            throw new AccesoNoAutorizadoException("Solo director o docente pueden usar el chat operativo.");
        }
    }

    private MensajeChatResponse mapear(MensajeChat mensaje) {
        return new MensajeChatResponse(
                mensaje.getId(),
                mensaje.getTexto(),
                mensaje.getUsuario().getNombre(),
                mensaje.getUsuario().getRol().name(),
                mensaje.getEnviadoEn()
        );
    }
}