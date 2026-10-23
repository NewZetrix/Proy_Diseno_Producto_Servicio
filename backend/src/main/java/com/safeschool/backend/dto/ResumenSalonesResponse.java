package com.safeschool.backend.dto;

import com.safeschool.backend.model.TipoEmergencia;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumenSalonesResponse {
    private Long emergenciaId;
    private TipoEmergencia tipoEmergencia;
    private int totalSalones;
    private int salonesConfirmados;
    private int salonesPendientes;
    private List<SalonEstadoDto> salones;
}