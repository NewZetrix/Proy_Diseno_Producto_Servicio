package com.safeschool.backend.service;

import com.safeschool.backend.exception.RecursoNoEncontradoException;
import com.safeschool.backend.model.TipoEmergencia;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProtocoloInstruccionesService {

    private static final Map<TipoEmergencia, List<String>> INSTRUCCIONES = Map.of(
            TipoEmergencia.SISMO, List.of(
                    "Conserve la calma y aléjese de ventanas",
                    "Agáchese, cúbrase bajo una estructura firme y sujétese",
                    "Cuando el movimiento cese, evacúe en orden hacia la zona segura",
                    "No use ascensores y siga las indicaciones del brigadista"
            ),
            TipoEmergencia.INCENDIO, List.of(
                    "Active la alarma y avise al personal más cercano",
                    "No abra puertas calientes; evacúe por la ruta más segura",
                    "Si hay humo, avance agachado cubriéndose nariz y boca",
                    "Reúnase en el punto de encuentro y no regrese al edificio"
            ),
            TipoEmergencia.INTRUSO, List.of(
                    "Cierre y asegure la puerta del salón si es posible",
                    "Apague luces, guarde silencio y aléjese de puertas y ventanas",
                    "No abra a nadie hasta la orden del director o autoridad",
                    "Espere instrucciones por el canal oficial del colegio"
            )
    );

    public List<String> obtenerPorTipo(TipoEmergencia tipo) {
        List<String> pasos = INSTRUCCIONES.get(tipo);
        if (pasos == null || pasos.isEmpty()) {
            throw new RecursoNoEncontradoException("No hay instrucciones para el tipo: " + tipo);
        }
        return pasos;
    }

    public List<String> obtenerPorNombre(String tipoTexto) {
        if (tipoTexto == null || tipoTexto.isBlank()) {
            throw new RecursoNoEncontradoException("Debe indicar el tipo de emergencia");
        }
        try {
            return obtenerPorTipo(TipoEmergencia.valueOf(tipoTexto.trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new RecursoNoEncontradoException("Tipo de emergencia no válido: " + tipoTexto);
        }
    }
}