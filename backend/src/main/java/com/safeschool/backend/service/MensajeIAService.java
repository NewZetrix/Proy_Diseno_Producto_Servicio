package com.safeschool.backend.service;

import org.springframework.stereotype.Service;

@Service
public class MensajeIAService {

    public String generarMensajeSeguridad(String nombreEstudiante, String tipoEmergencia) {
        try {
            // Lógica de integración con modelo ligero (ej. cliente HTTP a API de IA)
            return "Estimado apoderado, le informamos que su hijo/a " + nombreEstudiante + 
                   " se encuentra a salvo tras la alerta de " + tipoEmergencia + ". Su bienestar es nuestra prioridad.";
        } catch (Exception e) {
            // Plantilla fija de respaldo (Fallback requerido por la guía)
            return "Su hijo/a " + nombreEstudiante + " se encuentra a salvo en el colegio (" + tipoEmergencia + ").";
        }
    }
}