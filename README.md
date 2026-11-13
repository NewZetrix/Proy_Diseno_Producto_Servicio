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

### Notificaciones (HU03)

- Para una base existente, ejecutar `database/migrations/001_hu03_notificaciones.sql`. En una base nueva, `database/schema.sql` ya incluye las tablas y columnas de HU03.
- `GET /api/notificaciones` devuelve las notificaciones del apoderado autenticado, ordenadas de más reciente a más antigua.
- Al confirmar un salón, el backend guarda una notificación por estudiante asociado y la deja disponible en el historial.
- La tabla `dispositivo` creada por una versión anterior no se usa. Se conserva en bases existentes para evitar borrar datos; no se crea en una base nueva.

### Notificaciones móviles para apoderados (HU03)

- La app consulta `GET /api/notificaciones` cada 10 segundos mientras el centro de alertas está abierto. Al detectar un aviso nuevo, muestra un diálogo dentro de SafeSchool.
- Esta alternativa no usa notificaciones del sistema ni envía push remotos; no avisa cuando la pantalla de alertas no está abierta o la app está en segundo plano. Para la demo, mantén SafeSchool abierta en esa pantalla.
- El proyecto usa Expo SDK 58 para ser compatible con Expo Go SDK 58. Desde `mobile/`, inicia Metro con `npx expo start -c` y abre el proyecto con Expo Go.
- Para la demo: inicia sesión como apoderado en Expo Go, deja abierto el centro de alertas y confirma un salón desde la cuenta docente. El aviso aparecerá en el historial y como diálogo emergente dentro de la app.

## Flujo de trabajo con Git

- `main`: versión estable y demostrable.
- `dev`: rama de integración.
- `feature/...`: una rama por tarea o historia, creada desde `dev`.

Reglas: no se hace push directo a `main` ni a `dev`; todo entra por pull request hacia `dev` con una aprobación de otro integrante. Los commits siguen el formato `tipo: descripción (HUxx)`, con los tipos `feat`, `fix`, `test`, `docs`, `chore` y `refactor`.