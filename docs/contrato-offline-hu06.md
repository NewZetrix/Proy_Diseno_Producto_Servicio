# Contrato offline – HU06

## Acción crítica
PUT /api/emergencias/{emergenciaId}/salones/{salonId}/confirmacion
Auth: Bearer JWT, rol DOCENTE, salón propio, emergencia ACTIVA.

## Idempotencia
- 1ª vez PENDIENTE → A_SALVO + notificación padres (evento).
- Reintentos con mismo emergenciaId+salonId ya A_SALVO → 200, mismo estado, sin nueva notificación.

## Cliente offline
1. Sin red: encolar {emergenciaId, salonId, token, createdAt}.
2. Al recuperar red: reenviar en orden; 200 o ya A_SALVO = OK y sacar de cola.
3. 401 → pedir login; no borrar cola hasta reauth si el token se renueva.
4. 409 emergencia inactiva → descartar acción y avisar.

## Opcional
Header o campo lastSync en respuestas de lectura (futuro).