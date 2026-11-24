import { api } from './api';

export type MensajeChat = {
  id: number;
  texto: string;
  nombreRemitente: string;
  rolRemitente: string;
  enviadoEn: string;
};

export async function listarMensajesChat(
  token: string,
  emergenciaId: number
): Promise<MensajeChat[]> {
  return api<MensajeChat[]>(`/api/emergencias/${emergenciaId}/chat`, {
    method: 'GET',
    token,
  });
}

export async function enviarMensajeChat(
  token: string,
  emergenciaId: number,
  texto: string
): Promise<MensajeChat> {
  return api<MensajeChat>(`/api/emergencias/${emergenciaId}/chat`, {
    method: 'POST',
    token,
    body: { texto },
  });
}