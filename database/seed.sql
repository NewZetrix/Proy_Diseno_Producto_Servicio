USE safeschool;

INSERT INTO colegio (id, nombre, direccion) VALUES
  (1, 'I.E. San Martín de Porres', 'Av. Los Álamos 123, Lima');

-- Contraseña de prueba para todos los usuarios: SafeSchool2026
-- (hash BCrypt, compatible con Spring Security; solo para desarrollo)
INSERT INTO usuario (id, colegio_id, nombre, correo, password_hash, rol) VALUES
  (1, 1, 'Carlos Mendoza', 'director@safeschool.test', '$2a$10$EXhgSrU48JvZRczXCgbX.OikKmQf/u9xp/U4yXfzvRNAagcfX8C.q', 'DIRECTOR'),
  (2, 1, 'Lucía Torres',   'lucia@safeschool.test',    '$2a$10$EXhgSrU48JvZRczXCgbX.OikKmQf/u9xp/U4yXfzvRNAagcfX8C.q', 'DOCENTE'),
  (3, 1, 'Pedro Ramírez',  'pedro@safeschool.test',    '$2a$10$EXhgSrU48JvZRczXCgbX.OikKmQf/u9xp/U4yXfzvRNAagcfX8C.q', 'DOCENTE'),
  (4, 1, 'María Quispe',   'maria@safeschool.test',    '$2a$10$EXhgSrU48JvZRczXCgbX.OikKmQf/u9xp/U4yXfzvRNAagcfX8C.q', 'PADRE'),
  (5, 1, 'Jorge Huamán',   'jorge@safeschool.test',    '$2a$10$EXhgSrU48JvZRczXCgbX.OikKmQf/u9xp/U4yXfzvRNAagcfX8C.q', 'PADRE');

INSERT INTO salon (id, colegio_id, docente_id, nombre, grado) VALUES
  (1, 1, 2, '5.° B', 'Quinto de primaria'),
  (2, 1, 3, '3.° A', 'Tercero de secundaria'),
  (3, 1, 3, '4.° C', 'Cuarto de secundaria');

INSERT INTO estudiante (id, salon_id, apoderado_id, nombre) VALUES
  (1, 1, 4, 'Diego Quispe'),
  (2, 1, 4, 'Ana Quispe'),
  (3, 2, 5, 'Luis Huamán'),
  (4, 3, 5, 'Sofía Huamán');