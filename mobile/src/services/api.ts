import { API_URL } from '../constants/config';

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

/** Error de la API. status = 0 significa que no hubo conexión con el servidor. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Sin conexión con el servidor', 0);
  }

  if (!response.ok) {
    let mensaje = `Error ${response.status}`;
    try {
      const data = await response.json();
      mensaje = data.mensaje ?? data.error ?? mensaje;
    } catch {
      // sin cuerpo JSON
    }
    throw new ApiError(mensaje, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Mensaje amigable para mostrar en pantalla según el tipo de error. */
export function mensajeDeError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 0) {
      return 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
    }
    if (e.status === 401) {
      return 'Tu sesión venció. Inicia sesión de nuevo.';
    }
    if (e.status === 403) {
      return 'No tienes permiso para realizar esta acción.';
    }
    return e.message;
  }
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
}