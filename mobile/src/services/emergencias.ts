import { api } from './api';

export interface EmergenciaResponse {
  id: number;
  tipo: string;
  estado: string;
  activadaEn: string;
  instrucciones: string[];
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

export interface SalonDocenteResponse {
  salonId: number;
  nombreSalon: string;
  estado: 'PENDIENTE' | 'A_SALVO';
  horaConfirmacion: string | null;
  docenteEncargado: string;
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

export const obtenerSalonesDocente = async (
  token: string,
  emergenciaId: number
): Promise<SalonDocenteResponse[]> => {
  return api<SalonDocenteResponse[]>(`/api/emergencias/${emergenciaId}/mis-salones`, {
    method: 'GET',
    token,
  });
};

export const finalizarEmergencia = async (
  token: string,
  emergenciaId: number
): Promise<EmergenciaResponse> => {
  return api<EmergenciaResponse>(`/api/emergencias/${emergenciaId}/finalizar`, {
    method: 'PUT',
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