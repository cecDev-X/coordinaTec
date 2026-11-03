-- Ejecutar manualmente como propietario/administrador de la base, después de Flyway.
-- Define roles de grupo idempotentes; no borra usuarios, roles ni datos existentes.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_admin') THEN
        CREATE ROLE rol_admin NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_coordinador') THEN
        CREATE ROLE rol_coordinador NOLOGIN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_estudiante') THEN
        CREATE ROLE rol_estudiante NOLOGIN;
    END IF;
END
$$;

GRANT CONNECT ON DATABASE coordina_tec_db TO rol_admin, rol_coordinador, rol_estudiante;
GRANT USAGE ON SCHEMA public TO rol_admin, rol_coordinador, rol_estudiante;

-- Administrador: gestión completa del esquema actual.
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- Coordinación: lectura de catálogos y administración de horarios, bloqueos y citas.
GRANT SELECT ON departamento, estudiante, coordinador, tramite TO rol_coordinador;
GRANT SELECT, UPDATE ON formato, cita TO rol_coordinador;
GRANT SELECT, INSERT, UPDATE, DELETE ON horario, bloqueo_calendario TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE horario_id_seq, bloqueo_calendario_id_seq TO rol_coordinador;

-- Estudiante: lectura de catálogos y gestión de sus registros (el aislamiento
-- por usuario debe aplicarse en la API/RLS; estos permisos por sí solos no
-- limitan filas individuales).
GRANT SELECT ON departamento, coordinador, horario, bloqueo_calendario, tramite TO rol_estudiante;
GRANT SELECT, INSERT, UPDATE ON estudiante, formato, cita TO rol_estudiante;

-- Permisos para los objetos que se creen en migraciones posteriores.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO rol_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO rol_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO rol_coordinador, rol_estudiante;
