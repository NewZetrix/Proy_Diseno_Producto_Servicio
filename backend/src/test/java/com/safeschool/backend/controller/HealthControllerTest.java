package com.safeschool.backend.controller;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HealthControllerTest {

    @Test
    void healthDevuelveEstadoUp() {
        Map<String, String> respuesta = new HealthController().health();

        assertEquals("UP", respuesta.get("status"));
    }
}