INSERT INTO DEPARTAMENTO (nombre_area) VALUES
('Sistemas y Computación'),
('División de Estudios Profesionales'),
('Gestión Tecnológica y Vinculación');

INSERT INTO ESTUDIANTE (numeroControl, nombres, apellidos, carrera, password_hash) VALUES
('21160845', 'Carlos Eduardo', 'Martínez López', 'Ingeniería en Sistemas Computacionales', '$2b$12$K8p9a0dL1LXMIgoEDFrwOfMQb8123'),
('21160912', 'Valeria', 'Hernández Gómez', 'Ingeniería en Sistemas Computacionales', '$2b$12$M3n4b5vC6xZ7lKjHgFdSaQwErTy90'),
('22160310', 'Luis Fernando', 'Ramírez Cruz', 'Ingeniería Industrial', '$2b$12$P0o9i8u7Y6t5R4e3W2q1AsDfGhJkL');

INSERT INTO FORMATO (folio, asunto, fecha, tipo_tramite, observaciones) VALUES
('FMT-2026-001', 'Solicitud de sobrecarga académica', '2026-10-18', 'Carga Académica', 'Promedio del semestre anterior: 92.5'),
('FMT-2026-002', 'Liberación de créditos complementarios', '2026-10-19', 'Créditos Complementarios', 'Constancias de tutorías y congreso adjuntas'),
('FMT-2026-003', 'Anteproyecto de Residencia Profesional', '2026-10-20', 'Residencia Profesional', 'Empresa receptora validada por vinculación');

INSERT INTO COORDINADOR (rfc, nombre_completo, password_hash, departamento_id) VALUES
('GOMA800514H12', 'Ing. Alejandro Gómez Morales', '$2b$12$Z1x2c3v4B5n6M7a8S9d0FgHjKlQwE', 1),
('PECL850921M34', 'M.C. Laura Patricia Pérez Castro', '$2b$12$Q9w8e7r6T5y4U3i2O1p0LkJhGfDsA', 2),
('SAVA781103H89', 'Lic. Roberto Sánchez Vargas', '$2b$12$L0k9j8h7G6f5D4s3A2p1OiUyTrEwQ', 3);

INSERT INTO HORARIO (dia_semana, hora_inicio, hora_salida, duracion_minutos, coordinador_rfc) VALUES
(1, '09:00:00', '13:00:00', 20, 'GOMA800514H12'),
(3, '10:00:00', '14:00:00', 20, 'GOMA800514H12'),
(2, '08:30:00', '12:30:00', 30, 'PECL850921M34'),
(4, '11:00:00', '15:00:00', 15, 'SAVA781103H89');

INSERT INTO BLOQUEO_CALENDARIO (fecha_bloqueada, motivo, coordinador_rfc) VALUES
('2026-11-02', 'Suspensión oficial de labores (Día de Muertos)', 'GOMA800514H12'),
('2026-11-16', 'Día inhábil oficial', 'PECL850921M34'),
('2026-10-28', 'Reunión de Academia de Sistemas', 'GOMA800514H12');

INSERT INTO CITA (folio, fecha_programada, hora_inicio, hora_fin, estado, motivo, coordinador_rfc, estudiante_numeroControl, formato_folio) VALUES
('CIT-2026-0001', '2026-10-26', '09:00:00', '09:20:00', 'PENDIENTE', 'Revisión y firma de sobrecarga académica', 'GOMA800514H12', '21160845', 'FMT-2026-001'),
('CIT-2026-0002', '2026-10-27', '08:30:00', '09:00:00', 'CONFIRMADA', 'Validación de constancias para liberación de créditos', 'PECL850921M34', '21160912', 'FMT-2026-002'),
('CIT-2026-0003', '2026-10-29', '11:00:00', '11:15:00', 'PENDIENTE', 'Entrega de carta de presentación y anteproyecto', 'SAVA781103H89', '22160310', 'FMT-2026-003');

SELECT 
    c.folio AS folio_cita,
    c.fecha_programada,
    c.hora_inicio,
    c.hora_fin,
    c.estado,
    e.numeroControl AS num_control,
    e.nombres || ' ' || e.apellidos AS estudiante,
    e.carrera,
    coord.nombre_completo AS coordinador,
    d.nombre_area AS departamento,
    f.folio AS folio_formato,
    f.tipo_tramite,
    f.asunto AS asunto_formato
FROM CITA c
INNER JOIN ESTUDIANTE e ON c.estudiante_numeroControl = e.numeroControl
INNER JOIN COORDINADOR coord ON c.coordinador_rfc = coord.rfc
INNER JOIN DEPARTAMENTO d ON coord.departamento_id = d.id
INNER JOIN FORMATO f ON c.formato_folio = f.folio
ORDER BY c.fecha_programada ASC, c.hora_inicio ASC;

SELECT 
    c.nombre_completo,
    h.dia_semana,
    h.hora_inicio,
    h.hora_salida,
    h.duracion_minutos
FROM HORARIO h
INNER JOIN COORDINADOR c ON h.coordinador_rfc = c.rfc
WHERE c.rfc = 'GOMA800514H12'
ORDER BY h.dia_semana;

UPDATE CITA
SET estado = 'CONFIRMADA'
WHERE folio = 'CIT-2026-0001';

UPDATE FORMATO
SET observaciones = 'Aprobado sin observaciones. Pasa a firma de jefatura.'
WHERE folio = 'FMT-2026-001';

DELETE FROM BLOQUEO_CALENDARIO
WHERE coordinador_rfc = 'GOMA800514H12' 
  AND fecha_bloqueada = '2026-10-28';