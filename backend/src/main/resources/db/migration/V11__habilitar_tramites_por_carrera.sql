CREATE TABLE carrera_tramite (
    carrera VARCHAR(100) NOT NULL REFERENCES carrera(nombre) ON UPDATE CASCADE ON DELETE CASCADE,
    tramite_id BIGINT NOT NULL REFERENCES tramite(id) ON DELETE CASCADE,
    habilitado BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (carrera, tramite_id)
);

INSERT INTO carrera_tramite (carrera, tramite_id, habilitado)
SELECT c.nombre, t.id, t.activo
FROM carrera c
CROSS JOIN tramite t
ON CONFLICT (carrera, tramite_id) DO NOTHING;
