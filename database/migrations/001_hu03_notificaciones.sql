USE safeschool;

CREATE TABLE dispositivo (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT NOT NULL,
  token_fcm VARCHAR(512) NOT NULL UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

ALTER TABLE notificacion
  ADD COLUMN estudiante_id BIGINT NULL,
  ADD COLUMN emergencia_id BIGINT NULL,
  ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'FALLIDA',
  ADD CONSTRAINT fk_notificacion_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiante(id),
  ADD CONSTRAINT fk_notificacion_emergencia
    FOREIGN KEY (emergencia_id) REFERENCES emergencia(id);
