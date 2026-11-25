ALTER TABLE estudiante
    ADD COLUMN correo_verificado BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM estudiante
        WHERE correo IS NOT NULL AND BTRIM(correo) <> ''
        GROUP BY LOWER(BTRIM(correo))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Hay correos duplicados en estudiante. Resuelve las cuentas duplicadas antes de aplicar V16.';
    END IF;
END;
$$;

CREATE UNIQUE INDEX uq_estudiante_correo_normalizado
    ON estudiante (LOWER(BTRIM(correo)))
    WHERE correo IS NOT NULL AND BTRIM(correo) <> '';

CREATE TABLE estudiante_verificacion_correo (
    numerocontrol VARCHAR(15) PRIMARY KEY
        REFERENCES estudiante(numerocontrol) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vence_en TIMESTAMPTZ NOT NULL
);
