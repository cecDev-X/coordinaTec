ALTER TABLE tramite
    ADD COLUMN duracion_minutos INT NOT NULL DEFAULT 20
        CHECK (duracion_minutos BETWEEN 5 AND 480);

-- Para formatos existentes sin un tipo configurado, crea un tipo básico y editable.
INSERT INTO tramite (nombre, periodo_dias, requisitos, activo, prioridad, duracion_minutos)
SELECT DISTINCT f.tipo_tramite, 1, 'Requisitos no especificados', TRUE, 'MEDIA', 20
FROM formato f
WHERE NOT EXISTS (
    SELECT 1 FROM tramite t WHERE t.nombre = f.tipo_tramite
)
ON CONFLICT (nombre) DO NOTHING;

ALTER TABLE formato
    ADD COLUMN tramite_id BIGINT;

UPDATE formato f
SET tramite_id = t.id
FROM tramite t
WHERE t.nombre = f.tipo_tramite;

ALTER TABLE formato
    ALTER COLUMN tramite_id SET NOT NULL;

ALTER TABLE formato
    ADD CONSTRAINT fk_formato_tramite
        FOREIGN KEY (tramite_id)
        REFERENCES tramite(id)
        ON DELETE RESTRICT;

CREATE INDEX idx_formato_tramite ON formato(tramite_id);
