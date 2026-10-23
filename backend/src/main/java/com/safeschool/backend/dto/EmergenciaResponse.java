package com.safeschool.backend.dto;

import com.safeschool.backend.model.EstadoEmergencia;
import com.safeschool.backend.model.TipoEmergencia;

import java.time.LocalDateTime;
import java.util.List;

public record EmergenciaResponse(
        Integer id,
        TipoEmergencia tipo,
        EstadoEmergencia estado,
        LocalDateTime activadaEn,
        List<String> instrucciones
) {}