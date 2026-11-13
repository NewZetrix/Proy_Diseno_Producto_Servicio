package com.safeschool.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * HU-IA01: genera el mensaje a padres con tono tranquilizador.
 * Intenta un generador "ligero" con tope de 2 segundos; si falla o no hay
 * configuración, usa la plantilla fija de respaldo.
 */
@Service
public class MensajeIAService {

    private static final Logger log = LoggerFactory.getLogger(MensajeIAService.class);
    private static final long TIMEOUT_MS = 2000L;

    private final boolean iaHabilitada;

    public MensajeIAService(
            @Value("${app.ia.enabled:false}") boolean iaHabilitada) {
        this.iaHabilitada = iaHabilitada;
    }

    public String generarMensajeSeguridad(String nombreHijo, String tipoEmergencia) {
        String nombre = (nombreHijo == null || nombreHijo.isBlank()) ? "su hijo/a" : nombreHijo.trim();
        String tipo = (tipoEmergencia == null || tipoEmergencia.isBlank()) ? "emergencia" : tipoEmergencia.trim();

        if (!iaHabilitada) {
            return plantillaRespaldo(nombre, tipo);
        }

        try {
            return CompletableFuture
                    .supplyAsync(() -> generarConModeloLigero(nombre, tipo))
                    .orTimeout(TIMEOUT_MS, TimeUnit.MILLISECONDS)
                    .join();
        } catch (Exception e) {
            Throwable causa = e.getCause() != null ? e.getCause() : e;
            if (causa instanceof TimeoutException) {
                log.warn("IA superó el límite de {} ms; se usa plantilla de respaldo", TIMEOUT_MS);
            } else {
                log.warn("IA no disponible ({}). Se usa plantilla de respaldo", causa.getMessage());
            }
            return plantillaRespaldo(nombre, tipo);
        }
    }

    /**
     * Generador local ligero (sin API externa). Cumple tono tranquilizador
     * y datos obligatorios. Si más adelante hay API real, se reemplaza este método.
     */
    private String generarConModeloLigero(String nombreHijo, String tipoEmergencia) {
        return "Estimado apoderado: le informamos con calma que "
                + nombreHijo
                + " se encuentra a salvo en el colegio tras el protocolo de "
                + tipoEmergencia
                + ". El personal está siguiendo el procedimiento y le mantendremos al tanto.";
    }

    /** Plantilla fija obligatoria si la IA falla, se demora o está desactivada. */
    String plantillaRespaldo(String nombreHijo, String tipoEmergencia) {
        return "Su hijo/a "
                + nombreHijo
                + " se encuentra a salvo en el colegio ante la emergencia de "
                + tipoEmergencia
                + ".";
    }
}