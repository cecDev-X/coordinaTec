CREATE TABLE notificacion_cita (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folio VARCHAR(50) NOT NULL REFERENCES cita(folio) ON DELETE CASCADE,
    destinatario VARCHAR(120) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('COORDINADOR', 'JEFE_COORDINADORES')),
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida_en TIMESTAMP,
    UNIQUE (folio, destinatario, rol)
);

CREATE INDEX idx_notificacion_cita_destinatario
    ON notificacion_cita (rol, destinatario, creada_en DESC);

CREATE FUNCTION notificar_cita_agendada() RETURNS trigger AS $$
BEGIN
    INSERT INTO notificacion_cita (folio, destinatario, rol)
    SELECT NEW.folio, username, 'COORDINADOR'
    FROM coordinador WHERE rfc = NEW.coordinador_rfc;

    INSERT INTO notificacion_cita (folio, destinatario, rol)
    SELECT NEW.folio, username, 'JEFE_COORDINADORES'
    FROM jefe_coordinadores WHERE activo = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificar_cita_agendada
AFTER INSERT ON cita
FOR EACH ROW EXECUTE FUNCTION notificar_cita_agendada();
