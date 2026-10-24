CREATE DATABASE IF NOT EXISTS safeschool;
USE safeschool;

CREATE TABLE colegio (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(200)
);

CREATE TABLE usuario (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  colegio_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('DIRECTOR', 'DOCENTE', 'PADRE') NOT NULL,
  FOREIGN KEY (colegio_id) REFERENCES colegio(id)
);

CREATE TABLE salon (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  colegio_id BIGINT NOT NULL,
  docente_id BIGINT NOT NULL,
  nombre VARCHAR(30) NOT NULL,
  grado VARCHAR(30),
  FOREIGN KEY (colegio_id) REFERENCES colegio(id),
  FOREIGN KEY (docente_id) REFERENCES usuario(id)
);

CREATE TABLE estudiante (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  salon_id BIGINT NOT NULL,
  apoderado_id BIGINT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (salon_id) REFERENCES salon(id),
  FOREIGN KEY (apoderado_id) REFERENCES usuario(id)
);

CREATE TABLE emergencia (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  colegio_id BIGINT NOT NULL,
  activada_por BIGINT NOT NULL,
  tipo ENUM('SISMO', 'INCENDIO', 'INTRUSO') NOT NULL,
  estado ENUM('ACTIVA', 'FINALIZADA') NOT NULL DEFAULT 'ACTIVA',
  activada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizada_en DATETIME NULL,
  FOREIGN KEY (colegio_id) REFERENCES colegio(id),
  FOREIGN KEY (activada_por) REFERENCES usuario(id)
);

CREATE TABLE confirmacion_salon (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  emergencia_id BIGINT NOT NULL,
  salon_id BIGINT NOT NULL,
  confirmado_por BIGINT NULL,
  estado ENUM('PENDIENTE', 'A_SALVO') NOT NULL DEFAULT 'PENDIENTE',
  confirmado_en DATETIME NULL,
  UNIQUE (emergencia_id, salon_id),
  FOREIGN KEY (emergencia_id) REFERENCES emergencia(id),
  FOREIGN KEY (salon_id) REFERENCES salon(id),
  FOREIGN KEY (confirmado_por) REFERENCES usuario(id)
);

CREATE TABLE notificacion (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'ENVIADA',
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);