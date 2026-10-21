import { api } from './api';
import type { Rol } from '../context/SessionContext';

export type LoginResponse = {
  token: string;
  tipo: string;
  id: number;
  nombre: string;
  rol: Exclude<Rol, null>;
};

export async function login(correo: string, password: string): Promise<LoginResponse> {
  return api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { correo, password },
  });
}