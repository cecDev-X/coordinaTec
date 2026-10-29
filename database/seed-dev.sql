-- Datos ficticios para desarrollo local. Ejecutar manualmente después de Flyway V1.
-- Los valores de password_hash son marcadores que no sirven para iniciar sesión.
-- Si se vuelve a ejecutar, conserva los datos existentes sin duplicar filas.

BEGIN;

INSERT INTO departamento (nombre_area)
SELECT 'Departamento de demostración'
WHERE NOT EXISTS (
    SELECT 1 FROM departamento WHERE nombre_area = 'Departamento de demostración'
);

INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash)
VALUES ('DEMO0001', 'Ana', 'Ejemplo', 'Ingeniería en Sistemas', '!demo-no-login!')
ON CONFLICT (numerocontrol) DO NOTHING;

INSERT INTO formato (folio, asunto, tipo_tramite, observaciones)
VALUES ('FMT-DEMO-001', 'Solicitud de asesoría', 'Asesoría académica', 'Formato ficticio')
ON CONFLICT (folio) DO NOTHING;

INSERT INTO coordinador (rfc, nombre_completo, password_hash, departamento_id)
SELECT 'DEMO000000001', 'Coordinador de ejemplo', '!demo-no-login!', id
FROM departamento
WHERE nombre_area = 'Departamento de demostración'
ORDER BY id
LIMIT 1
ON CONFLICT (rfc) DO NOTHING;

INSERT INTO horario (dia_semana, hora_inicio, hora_salida, duracion_minutos, coordinador_rfc)
SELECT 1, '10:00', '12:00', 20, 'DEMO000000001'
WHERE NOT EXISTS (
    SELECT 1 FROM horario
    WHERE coordinador_rfc = 'DEMO000000001'
      AND dia_semana = 1 AND hora_inicio = '10:00'
);

INSERT INTO bloqueo_calendario (fecha_bloqueada, motivo, coordinador_rfc)
SELECT '2030-11-02', 'Bloqueo de demostración', 'DEMO000000001'
WHERE NOT EXISTS (
    SELECT 1 FROM bloqueo_calendario
    WHERE coordinador_rfc = 'DEMO000000001' AND fecha_bloqueada = '2030-11-02'
);

INSERT INTO cita (folio, fecha_programada, hora_inicio, hora_fin, estado, motivo,
                  coordinador_rfc, estudiante_numerocontrol, formato_folio)
VALUES ('CIT-DEMO-001', CURRENT_DATE + 7, '10:00', '10:20', 'PROGRAMADA',
        'Consulta de ejemplo', 'DEMO000000001', 'DEMO0001', 'FMT-DEMO-001')
ON CONFLICT (folio) DO NOTHING;

COMMIT;
