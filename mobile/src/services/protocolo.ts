import api from './api';

export interface PasoProtocolo {
  orden?: number;
  paso?: number;
  titulo?: string;
  descripcion: string;
}

const FALLBACK_POR_TIPO: Record<string, PasoProtocolo[]> = {
  SISMO: [
    { paso: 1, descripcion: 'Mantenga la calma y ubíquese en la zona segura interna del aula.' },
    { paso: 2, descripcion: 'Aléjese de ventanas, vidrios y objetos que puedan caer.' },
    { paso: 3, descripcion: 'Espere a que pase el movimiento y evacue de forma ordenada.' },
    { paso: 4, descripcion: 'Verifique a sus estudiantes y presione "Salón a salvo".' },
  ],
  INCENDIO: [
    { paso: 1, descripcion: 'Conserve la calma y active o reporte la alarma de incendio.' },
    { paso: 2, descripcion: 'Si hay humo, avance agachado cerca del piso y cubra nariz y boca.' },
    { paso: 3, descripcion: 'Evacue por la ruta señalizada; no use ascensores ni regrese por objetos.' },
    { paso: 4, descripcion: 'Confirme el estado de su salón al llegar a la zona segura.' },
  ],
  INTRUSO: [
    { paso: 1, descripcion: 'Mantenga el silencio y aleje a los estudiantes de puertas y ventanas.' },
    { paso: 2, descripcion: 'Asegure o bloquee el acceso del aula si el protocolo lo indica.' },
    { paso: 3, descripcion: 'Espere indicaciones oficiales del director o autoridades.' },
    { paso: 4, descripcion: 'Confirme el estado de su salón cuando sea seguro hacerlo.' },
  ],
};

export async function obtenerInstruccionesProtocolo(
  tipoEmergencia?: string
): Promise<PasoProtocolo[]> {
  const tipoNormalizado = (tipoEmergencia || 'SISMO').toUpperCase();

  try {
    // Ajusta el endpoint si tu ProtocoloController expone otra ruta (ej. /protocolos?tipo=SISMO)
    const response = await api.get(`/protocolos/${tipoNormalizado}`);
    const data = response?.data;

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    if (Array.isArray(data?.pasos) && data.pasos.length > 0) {
      return data.pasos;
    }
    if (Array.isArray(data?.instrucciones) && data.instrucciones.length > 0) {
      return data.instrucciones;
    }
  } catch (error) {
    console.warn('Usando instrucciones de respaldo para protocolo:', tipoNormalizado, error);
  }

  return FALLBACK_POR_TIPO[tipoNormalizado] || FALLBACK_POR_TIPO.SISMO;
}