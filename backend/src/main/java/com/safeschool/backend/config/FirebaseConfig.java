package com.safeschool.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.safeschool.backend.service.FirebasePushNotificationSender;
import com.safeschool.backend.service.PushNotificationSender;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
@ConditionalOnProperty(name = "app.firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp(@Value("${app.firebase.credentials-path}") String credentialsPath)
            throws IOException {
        if (credentialsPath.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_CREDENTIALS_PATH es obligatorio cuando FIREBASE_ENABLED=true");
        }
        try (FileInputStream credentials = new FileInputStream(credentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentials))
                    .build();
            return FirebaseApp.initializeApp(options, "safeschool");
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }

    @Bean
    public PushNotificationSender pushNotificationSender(FirebaseMessaging firebaseMessaging) {
        return new FirebasePushNotificationSender(firebaseMessaging);
    }
}
