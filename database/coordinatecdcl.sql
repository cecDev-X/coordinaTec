-- limpieza previa de privilegios y roles 
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_estudiante') THEN
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM rol_estudiante';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM rol_estudiante';
        EXECUTE 'REVOKE ALL PRIVILEGES ON DATABASE citas_tutorias FROM rol_estudiante';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_coordinador') THEN
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM rol_coordinador';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM rol_coordinador';
        EXECUTE 'REVOKE ALL PRIVILEGES ON DATABASE citas_tutorias FROM rol_coordinador';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rol_admin') THEN
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM rol_admin';
        EXECUTE 'REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM rol_admin';
        EXECUTE 'REVOKE ALL PRIVILEGES ON DATABASE citas_tutorias FROM rol_admin';
    END IF;
END
$$;

DROP USER IF EXISTS app_coordinatec;
DROP ROLE IF EXISTS rol_estudiante;
DROP ROLE IF EXISTS rol_coordinador;
DROP ROLE IF EXISTS rol_admin;

-- creación de Roles de Grupo (NOLOGIN)

CREATE ROLE rol_admin NOLOGIN;
CREATE ROLE rol_coordinador NOLOGIN;
CREATE ROLE rol_estudiante NOLOGIN;

-- Permiso de conexión a la base de datos y uso del esquema public
GRANT CONNECT ON DATABASE citas_tutorias TO rol_admin, rol_coordinador, rol_estudiante;
GRANT USAGE ON SCHEMA public TO rol_admin, rol_coordinador, rol_estudiante;


-- asignación de Permisos sobre Tablas y Secuencias

-- ROL ADMINISTRADOR: Control total sobre tablas y secuencias (SERIAL)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

-- ROL COORDINADOR:Puede consultar departamentos y datos de estudiantes para sus citas
GRANT SELECT ON DEPARTAMENTO, ESTUDIANTE TO rol_coordinador;

-- Puede consultar su perfil y actualizar sus datos (ej. contraseña)
GRANT SELECT, UPDATE ON COORDINADOR TO rol_coordinador;

-- Puede administrar completamente sus horarios y bloqueos de calendario
GRANT SELECT, INSERT, UPDATE, DELETE ON HORARIO, BLOQUEO_CALENDARIO TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE horario_id_seq, bloqueo_calendario_id_seq TO rol_coordinador;

-- Puede ver formatos y citas, y actualizar su estado u observaciones
GRANT SELECT, UPDATE ON FORMATO, CITA TO rol_coordinador;

-- ROL ESTUDIANTE:Puede ver departamentos, coordinadores, horarios disponibles y fechas bloqueadas
GRANT SELECT ON DEPARTAMENTO, COORDINADOR, HORARIO, BLOQUEO_CALENDARIO TO rol_estudiante;

-- Puede registrarse, ver su perfil y actualizar sus datos
GRANT SELECT, INSERT, UPDATE ON ESTUDIANTE TO rol_estudiante;

-- Puede llenar el formato de prerrequisito y agendar/cancelar su cita
GRANT SELECT, INSERT, UPDATE ON FORMATO, CITA TO rol_estudiante;

-- Usuario de Conexión para el Backend
CREATE USER app_coordinatec WITH PASSWORD 'Coordinatec_2026_Secure!';
GRANT rol_admin, rol_coordinador, rol_estudiante TO app_coordinatec;