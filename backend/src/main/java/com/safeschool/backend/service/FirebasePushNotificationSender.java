package com.safeschool.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

public class FirebasePushNotificationSender implements PushNotificationSender {

    private final FirebaseMessaging firebaseMessaging;

    public FirebasePushNotificationSender(FirebaseMessaging firebaseMessaging) {
        this.firebaseMessaging = firebaseMessaging;
    }

    @Override
    public void enviar(String token, String titulo, String mensaje) throws Exception {
        Message push = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(titulo)
                        .setBody(mensaje)
                        .build())
                .build();
        firebaseMessaging.send(push);
    }
}
