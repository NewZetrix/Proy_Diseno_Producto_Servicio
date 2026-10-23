package com.safeschool.backend.service;

import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;

@Service
public class NotificacionService {

    public void registrarTokenDispositivo(Long usuarioId, String tokenFcm) {
        // Lógica para guardar o actualizar el token FCM del apoderado
    }

    public List<Object> obtenerNotificacionesPorPadre(Long padreId) {
        // Retorna la lista de notificaciones del padre
        return Collections.emptyList();
    }
}