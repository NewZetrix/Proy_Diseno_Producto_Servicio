# SafeSchool

Plataforma de seguridad escolar para gestionar emergencias (sismo, incendio e intruso) en instituciones educativas. Proyecto del curso Diseño de Productos y Servicios (UTP).

## Stack

- App móvil: React Native
- Backend: Spring Boot (Java 21), arquitectura MVC
- Base de datos: MySQL
- Seguimiento del trabajo: Trello

## Estructura

```
backend/    API REST en Spring Boot
mobile/     App móvil en React Native
database/   Scripts SQL (schema.sql y seed.sql)
docs/       Modelo de datos, pruebas, PDCA y evidencias
```

## Requisitos

- Java 21 o superior
- MySQL 8 o superior
- Git
- Node.js (para la app móvil, cuando se agregue)

## Puesta en marcha del backend

1. Crear la base y las tablas: ejecutar `database/schema.sql` en MySQL.
2. Cargar los datos de prueba: ejecutar `database/seed.sql`.
3. Copiar `backend/.env.example` como `backend/.env` y completar el usuario y la contraseña de MySQL. Este archivo no se sube al repositorio.
4. Desde la carpeta `backend/`, ejecutar `.\mvnw spring-boot:run` (en Linux o Mac, `./mvnw spring-boot:run`).
5. Probar en el navegador: http://localhost:8080/api/health

### Notificaciones push (HU03)

- Para una base existente, ejecutar `database/migrations/001_hu03_notificaciones.sql`. En una base nueva, `database/schema.sql` ya incluye las tablas y columnas de HU03.
- Firebase Cloud Messaging está desactivado por defecto. Para habilitarlo, configurar `FIREBASE_ENABLED=true` y `FIREBASE_CREDENTIALS_PATH` con la ruta local al archivo de credenciales de una cuenta de servicio de Firebase. No subir ese archivo al repositorio.
- El apoderado autenticado registra o actualiza su token con `POST /api/dispositivos` y el cuerpo `{"tokenFcm":"..."}`. `GET /api/notificaciones` devuelve sus notificaciones ordenadas de más reciente a más antigua.
- La confirmación del salón se guarda antes de procesar los avisos; se crea una notificación por estudiante. El push se intenta dos veces y el estado queda como `ENVIADA` si al menos un dispositivo del apoderado lo recibe, o `FALLIDA` en caso contrario.

## Flujo de trabajo con Git

- `main`: versión estable y demostrable.
- `dev`: rama de integración.
- `feature/...`: una rama por tarea o historia, creada desde `dev`.

Reglas: no se hace push directo a `main` ni a `dev`; todo entra por pull request hacia `dev` con una aprobación de otro integrante. Los commits siguen el formato `tipo: descripción (HUxx)`, con los tipos `feat`, `fix`, `test`, `docs`, `chore` y `refactor`.