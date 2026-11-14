CREATE TABLE horario_tramite (
    horario_id INT NOT NULL REFERENCES horario(id) ON DELETE CASCADE,
    tramite_id BIGINT NOT NULL REFERENCES tramite(id) ON DELETE RESTRICT,
    PRIMARY KEY (horario_id, tramite_id)
);

INSERT INTO horario_tramite (horario_id, tramite_id)
SELECT h.id, t.id
FROM horario h
CROSS JOIN tramite t
WHERE t.activo = TRUE
ON CONFLICT DO NOTHING;

ALTER TABLE horario DROP COLUMN duracion_minutos;
