package com.safeschool.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

class MensajeIAServiceTest {

    @Test
    void plantillaContieneNombreTipoYAsalvo() {
        MensajeIAService service = new MensajeIAService(false);

        String mensaje = service.generarMensajeSeguridad("Diego Quispe", "SISMO");

        assertTrue(mensaje.contains("Diego Quispe"));
        assertTrue(mensaje.contains("SISMO"));
        assertTrue(mensaje.toLowerCase().contains("a salvo"));
    }

    @Test
    void conIaDesactivadaUsaPlantillaFija() {
        MensajeIAService service = new MensajeIAService(false);

        String mensaje = service.generarMensajeSeguridad("Ana", "SISMO");

        assertEquals(
                "Su hijo/a Ana se encuentra a salvo en el colegio ante la emergencia de SISMO.",
                mensaje);
    }

    @Test
    void conIaActivadaGeneraMensajeTranquilizadorConDatosObligatorios() {
        MensajeIAService service = new MensajeIAService(true);

        String mensaje = service.generarMensajeSeguridad("Luis", "SISMO");

        assertTrue(mensaje.contains("Luis"));
        assertTrue(mensaje.contains("SISMO"));
        assertTrue(mensaje.toLowerCase().contains("a salvo"));
    }

    @Test
    void respondeEnMenosDeDosSegundos() {
        MensajeIAService service = new MensajeIAService(true);

        long inicio = System.nanoTime();
        service.generarMensajeSeguridad("Sofía", "SISMO");
        long duracionMs = (System.nanoTime() - inicio) / 1_000_000L;

        assertTrue(duracionMs < 2000L, "Debió responder en menos de 2 s, tardó " + duracionMs + " ms");
    }
}