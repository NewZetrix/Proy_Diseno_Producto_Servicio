package com.safeschool.backend.service;

import org.springframework.stereotype.Service;

@Service
public class MensajeIAService {

    // Genera el mensaje a padres con IA o respaldo ante fallos
    public String generarMensajeSeguridad(String nombreHijo, String tipoEmergencia) {
        try {
            // Lógica simulada o llamada al cliente de IA (limitada a < 2 segundos)
            // Si se conecta una API externa de IA, se envuelve en un timeout de 2s.
            boolean iaDisponible = true; 

            if (iaDisponible) {
                return "Estimado apoderado, le informamos que su hijo/a " + nombreHijo + 
                       " se encuentra a salvo en el colegio tras activarse el protocolo de " + tipoEmergencia + ".";
            }
        } catch (Exception e) {
            // Respaldo por plantilla fija si la IA falla o se demora
        }

        // Plantilla fija de respaldo obligatoria
        return "Su hijo/a " + nombreHijo + " se encuentra a salvo en el colegio ante la emergencia de " + tipoEmergencia + ".";
    }
}