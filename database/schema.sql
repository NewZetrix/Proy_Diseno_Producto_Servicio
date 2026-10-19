create database safeschool;
use safeschool;

CREATE TABLE colegio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(200)
);
CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colegio_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('DIRECTOR','DOCENTE','PADRE') NOT NULL,
  FOREIGN KEY (colegio_id) REFERENCES colegio(id)
);
CREATE TABLE salon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colegio_id INT NOT NULL,
  docente_id INT NOT NULL,
  nombre VARCHAR(30) NOT NULL,
  grado VARCHAR(30),
  FOREIGN KEY (colegio_id) REFERENCES colegio(id),
  FOREIGN KEY (docente_id) REFERENCES usuario(id)
);
CREATE TABLE estudiante (
  id INT AUTO_INCREMENT PRIMARY KEY,
  salon_id INT NOT NULL,
  apoderado_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (salon_id) REFERENCES salon(id),
  FOREIGN KEY (apoderado_id) REFERENCES usuario(id)
);
CREATE TABLE emergencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  colegio_id INT NOT NULL,
  activada_por INT NOT NULL,
  tipo ENUM('SISMO','INCENDIO','INTRUSO') NOT NULL,
  estado ENUM('ACTIVA','FINALIZADA') NOT NULL DEFAULT 'ACTIVA',
  activada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finalizada_en DATETIME NULL,
  FOREIGN KEY (colegio_id) REFERENCES colegio(id),
  FOREIGN KEY (activada_por) REFERENCES usuario(id)
);
CREATE TABLE confirmacion_salon (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emergencia_id INT NOT NULL,
  salon_id INT NOT NULL,
  confirmado_por INT NULL,
  estado ENUM('PENDIENTE','A_SALVO') NOT NULL DEFAULT 'PENDIENTE',
  confirmado_en DATETIME NULL,
  UNIQUE (emergencia_id, salon_id),
  FOREIGN KEY (emergencia_id) REFERENCES emergencia(id),
  FOREIGN KEY (salon_id) REFERENCES salon(id),
  FOREIGN KEY (confirmado_por) REFERENCES usuario(id)
);
CREATE TABLE notificacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emergencia_id INT NOT NULL,
  estudiante_id INT NOT NULL,
  apoderado_id INT NOT NULL,
  mensaje TEXT NOT NULL,
  estado ENUM('ENVIADA','FALLIDA') NOT NULL,
  enviada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (emergencia_id) REFERENCES emergencia(id),
  FOREIGN KEY (estudiante_id) REFERENCES estudiante(id),
  FOREIGN KEY (apoderado_id) REFERENCES usuario(id)
);