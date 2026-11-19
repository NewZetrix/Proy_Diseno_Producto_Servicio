import { api } from './api';

export type PasoProtocolo = {
  paso: number;
  descripcion: string;
};

/** El backend devuelve { tipo, instrucciones: string[] }. */
type InstruccionesResponse = {
  tipo: string;
  instrucciones: string[];
};

/** Convierte string[] en pasos numerados para que la UI nunca muestre undefined. */
export function normalizarPasos(instrucciones: string[] | undefined | null): PasoProtocolo[] {
  return (instrucciones ?? []).map((texto, i) => ({
    paso: i + 1,
    descripcion: texto,
  }));
}

/**
 * Respaldo local: mismos textos que ProtocoloInstruccionesService del backend,
 * para que pantalla y voz digan lo mismo si falla la red.
 * Si cambias los textos del backend, actualízalos aquí también.
 */
export const INSTRUCCIONES_LOCALES: Record<string, string[]> = {
  SISMO: [
    'Conserve la calma y aléjese de ventanas',
    'Agáchese, cúbrase bajo una estructura firme y sujétese',
    'Cuando el movimiento cese, evacúe en orden hacia la zona segura',
    'No use ascensores y siga las indicaciones del brigadista',
  ],
  INCENDIO: [
    'Active la alarma y avise al personal más cercano',
    'No abra puertas calientes; evacúe por la ruta más segura',
    'Si hay humo, avance agachado cubriéndose nariz y boca',
    'Reúnase en el punto de encuentro y no regrese al edificio',
  ],
  INTRUSO: [
    'Cierre y asegure la puerta del salón si es posible',
    'Apague luces, guarde silencio y aléjese de puertas y ventanas',
    'No abra a nadie hasta la orden del director o autoridad',
    'Espere instrucciones por el canal oficial del colegio',
  ],
};

export function instruccionesLocales(tipoEmergencia?: string): PasoProtocolo[] {
  const tipo = (tipoEmergencia ?? 'SISMO').trim().toUpperCase();
  return normalizarPasos(INSTRUCCIONES_LOCALES[tipo] ?? INSTRUCCIONES_LOCALES.SISMO);
}

/**
 * GET /api/protocolos/{tipo}/instrucciones (roles DIRECTOR y DOCENTE).
 * Si no hay token, falla la red o la respuesta viene vacía, usa el respaldo local.
 */
export async function obtenerInstruccionesProtocolo(
  tipoEmergencia?: string,
  token?: string | null
): Promise<PasoProtocolo[]> {
  const tipo = (tipoEmergencia ?? 'SISMO').trim().toUpperCase();
  if (!token) {
    return instruccionesLocales(tipo);
  }
  try {
    const data = await api<InstruccionesResponse>(
      `/api/protocolos/${encodeURIComponent(tipo)}/instrucciones`,
      { token }
    );
    const pasos = normalizarPasos(data.instrucciones);
    return pasos.length > 0 ? pasos : instruccionesLocales(tipo);
  } catch {
    return instruccionesLocales(tipo);
  }
}
