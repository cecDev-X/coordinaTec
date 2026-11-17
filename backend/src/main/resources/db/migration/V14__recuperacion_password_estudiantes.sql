CREATE TABLE estudiante_password_reset (
    numerocontrol VARCHAR(15) PRIMARY KEY REFERENCES estudiante(numerocontrol) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vence_en TIMESTAMPTZ NOT NULL,
    usado_en TIMESTAMPTZ
);
