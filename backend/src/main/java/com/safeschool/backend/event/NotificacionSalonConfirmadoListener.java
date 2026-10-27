package com.safeschool.backend.event;

import com.safeschool.backend.service.NotificacionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public class NotificacionSalonConfirmadoListener {

    private final NotificacionService notificacionService;

    public NotificacionSalonConfirmadoListener(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alConfirmarSalon(SalonConfirmadoEvent event) {
        try {
            notificacionService.notificarSalonConfirmado(event.emergenciaId(), event.salonId());
        } catch (RuntimeException error) {
            log.error("No se pudieron crear las notificaciones para emergencia {} y salón {}",
                    event.emergenciaId(), event.salonId(), error);
        }
    }
}
