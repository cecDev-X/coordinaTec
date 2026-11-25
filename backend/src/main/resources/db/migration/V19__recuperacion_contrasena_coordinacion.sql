ALTER TABLE coordinador ADD COLUMN correo_recuperacion VARCHAR(254);
ALTER TABLE jefe_coordinadores ADD COLUMN correo_recuperacion VARCHAR(254);

CREATE UNIQUE INDEX uq_coordinador_correo_recuperacion
    ON coordinador (LOWER(BTRIM(correo_recuperacion)))
    WHERE correo_recuperacion IS NOT NULL AND BTRIM(correo_recuperacion) <> '';

CREATE UNIQUE INDEX uq_jefe_correo_recuperacion
    ON jefe_coordinadores (LOWER(BTRIM(correo_recuperacion)))
    WHERE correo_recuperacion IS NOT NULL AND BTRIM(correo_recuperacion) <> '';

CREATE TABLE cuenta_coordinacion_password_reset (
    username VARCHAR(120) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('COORDINADOR', 'JEFE_COORDINADORES')),
    token_hash CHAR(64) NOT NULL UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vence_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ,
    PRIMARY KEY (username, rol)
);
