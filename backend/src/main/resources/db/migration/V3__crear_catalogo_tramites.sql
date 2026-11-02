CREATE TABLE tramite (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    periodo_dias INT NOT NULL CHECK (periodo_dias BETWEEN 1 AND 365),
    requisitos TEXT NOT NULL DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    prioridad VARCHAR(10) NOT NULL CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA'))
);

CREATE INDEX idx_tramite_activo ON tramite(activo);
