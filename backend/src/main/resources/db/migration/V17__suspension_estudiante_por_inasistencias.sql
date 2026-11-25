ALTER TABLE estudiante
    ADD COLUMN inasistencias_acumuladas INTEGER NOT NULL DEFAULT 0
        CHECK (inasistencias_acumuladas BETWEEN 0 AND 1),
    ADD COLUMN suspendido_hasta TIMESTAMPTZ;

CREATE INDEX idx_estudiante_suspendido_hasta
    ON estudiante (suspendido_hasta)
    WHERE suspendido_hasta IS NOT NULL;
