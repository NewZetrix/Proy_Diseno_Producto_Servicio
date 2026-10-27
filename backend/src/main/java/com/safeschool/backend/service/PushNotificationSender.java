package com.safeschool.backend.service;

public interface PushNotificationSender {

    void enviar(String token, String titulo, String mensaje) throws Exception;
}
