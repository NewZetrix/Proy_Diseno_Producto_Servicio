package com.safeschool.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalonEstadoDto {
    private Long salonId;
    private String nombreSalon;
    private String estado; // PENDIENTE o A_SALVO
    private LocalDateTime horaConfirmacion;
    private String docenteEncargado;
}