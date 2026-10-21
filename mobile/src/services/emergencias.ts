import { api } from './api';

export interface EmergenciaResponse {
  id: number;
  tipo: string;
  estado: string;
  fechaHoraInicio: string;
  protocolo: string;
}

export interface ConfirmacionResponse {
  id: number;
  salonId: number;
  nombreSalon: string;
  estado: string;
  fechaHoraConfirmacion: string;
  salonesConfirmados: number;
  totalSalones: number;
}

// HU01: Activar Emergencia
export const activarEmergencia = async (token: string, tipo: string = 'SISMO'): Promise<EmergenciaResponse> => {
  return api<EmergenciaResponse>('/api/emergencias', {
    method: 'POST',
    body: { tipo },
    token,
  });
};

// HU01: Obtener Emergencia Activa
export const obtenerEmergenciaActiva = async (token: string): Promise<EmergenciaResponse> => {
  return api<EmergenciaResponse>('/api/emergencias/activa', {
    method: 'GET',
    token,
  });
};

// HU02: Confirmar Salón a Salvo
export const confirmarSalonASalvo = async (
  token: string,
  emergenciaId: number,
  salonId: number
): Promise<ConfirmacionResponse> => {
  return api<ConfirmacionResponse>(`/api/emergencias/${emergenciaId}/salones/${salonId}/confirmacion`, {
    method: 'PUT',
    token,
  });
};