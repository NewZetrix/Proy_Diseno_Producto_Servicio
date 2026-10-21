package com.safeschool.backend.exception;

import com.safeschool.backend.dto.ApiError;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void recursoNoEncontradoDevuelve404() {
        ResponseEntity<ApiError> respuesta =
                handler.noEncontrado(new RecursoNoEncontradoException("Salón no encontrado"));

        assertEquals(404, respuesta.getStatusCode().value());
        assertEquals("Salón no encontrado", respuesta.getBody().mensaje());
    }

    @Test
    void conflictoDevuelve409() {
        ResponseEntity<ApiError> respuesta =
                handler.conflicto(new ConflictoException("Ya existe una emergencia activa"));

        assertEquals(409, respuesta.getStatusCode().value());
    }

    @Test
    void accesoNoAutorizadoDevuelve403() {
        ResponseEntity<ApiError> respuesta =
                handler.prohibido(new AccesoNoAutorizadoException("No es su salón"));

        assertEquals(403, respuesta.getStatusCode().value());
    }

    @Test
    void errorDeBaseDeDatosDevuelve503SinExponerDetalle() {
        ResponseEntity<ApiError> respuesta =
                handler.baseDeDatos(new DataAccessResourceFailureException("conexión caída"));

        assertEquals(503, respuesta.getStatusCode().value());
        assertEquals("La operación no pudo completarse. Intente nuevamente.",
                respuesta.getBody().mensaje());
    }

    @Test
    void credencialesInvalidasDevuelve401() {
        ResponseEntity<ApiError> respuesta =
                handler.credenciales(new CredencialesInvalidasException("Correo o contraseña incorrectos"));

        assertEquals(401, respuesta.getStatusCode().value());
    }
}