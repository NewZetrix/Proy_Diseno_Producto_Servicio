import { api } from './api';

export type NotificacionResponse = {
  id: number;
  mensaje: string;
  fechaCreacion: string;
  estado: string;
};

/**
 * Registra el token push del dispositivo para las notificaciones de apoderado (HU03 / HU14)
 */
export async function registrarDispositivo(tokenJwt: string, tokenDispositivo: string): Promise<void> {
  await api('/api/dispositivos', {
    method: 'POST',
    token: tokenJwt,
    body: { tokenDispositivo },
  });
}

/**
 * Obtiene la lista de notificaciones e historial de seguridad para el usuario con rol PADRE
 */
export async function obtenerNotificaciones(tokenJwt: string): Promise<NotificacionResponse[]> {
  return api<NotificacionResponse[]>('/api/notificaciones', {
    method: 'GET',
    token: tokenJwt,
  });
}