import { api } from './api';

export type Notificacion = {
  id: number;
  mensaje: string;
  estado: 'ENVIADA' | 'FALLIDA';
  fechaCreacion: string;
};

export function obtenerNotificaciones(tokenSesion: string): Promise<Notificacion[]> {
  return api<Notificacion[]>('/api/notificaciones', { token: tokenSesion });
}
