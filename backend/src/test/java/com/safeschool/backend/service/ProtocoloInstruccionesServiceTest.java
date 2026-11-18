package com.safeschool.backend.service;

import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.TipoEmergencia;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProtocoloInstruccionesServiceTest {

    private final ProtocoloInstruccionesService service = new ProtocoloInstruccionesService();

    @Test
    void sismoDevuelvePasosOrdenados() {
        List<String> pasos = service.obtenerPorTipo(TipoEmergencia.SISMO);
        assertFalse(pasos.isEmpty());
        assertTrue(pasos.get(0).toLowerCase().contains("calma")
                || pasos.get(0).toLowerCase().contains("agáchese")
                || pasos.get(0).toLowerCase().contains("agach"));
    }

    @Test
    void incendioEIntrusoTienenInstrucciones() {
        assertFalse(service.obtenerPorTipo(TipoEmergencia.INCENDIO).isEmpty());
        assertFalse(service.obtenerPorTipo(TipoEmergencia.INTRUSO).isEmpty());
    }

    @Test
    void nombreInvalidoLanzaRecursoNoEncontrado() {
        assertThrows(RecursoNoEncontradoException.class,
                () -> service.obtenerPorNombre("TSUNAMI"));
    }

    @Test
    void nombreValidoIgnoraMinusculas() {
        List<String> pasos = service.obtenerPorNombre("sismo");
        assertEquals(service.obtenerPorTipo(TipoEmergencia.SISMO), pasos);
    }
}