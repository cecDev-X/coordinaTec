CREATE TABLE carrera (
    nombre VARCHAR(100) PRIMARY KEY
);

INSERT INTO carrera (nombre) VALUES
    ('Ingeniería en Sistemas Computacionales'),
    ('Ingeniería Industrial'),
    ('Ingeniería Civil'),
    ('Ingeniería Química'),
    ('Ingeniería Mecatrónica'),
    ('Ingeniería Mecánica'),
    ('Ingeniería Eléctrica'),
    ('Ingeniería Electrónica'),
    ('Ingeniería en Gestión Empresarial'),
    ('Ingeniería Ambiental'),
    ('Ingeniería Bioquímica'),
    ('Licenciatura en Administración');

-- Unificar los nombres usados anteriormente para Sistemas sin perder asignaciones.
UPDATE estudiante SET carrera = 'Ingeniería en Sistemas Computacionales'
WHERE lower(btrim(carrera)) IN (
    'sistemas', 'ingeniería en sistemas', 'ingenieria en sistemas',
    'ingenieria en sistemas computacionales', 'ingeniería en sistemas computacionales'
);

INSERT INTO coordinador_carrera (coordinador_rfc, carrera)
SELECT coordinador_rfc, 'Ingeniería en Sistemas Computacionales'
FROM coordinador_carrera
WHERE lower(btrim(carrera)) IN (
    'sistemas', 'ingeniería en sistemas', 'ingenieria en sistemas',
    'ingenieria en sistemas computacionales', 'ingeniería en sistemas computacionales'
)
ON CONFLICT DO NOTHING;

DELETE FROM coordinador_carrera
WHERE carrera <> 'Ingeniería en Sistemas Computacionales'
  AND lower(btrim(carrera)) IN (
      'sistemas', 'ingeniería en sistemas', 'ingenieria en sistemas',
      'ingenieria en sistemas computacionales', 'ingeniería en sistemas computacionales'
  );

-- Conservar las demás carreras ya registradas en bases existentes.
INSERT INTO carrera (nombre)
SELECT DISTINCT carrera FROM estudiante WHERE carrera IS NOT NULL AND btrim(carrera) <> ''
ON CONFLICT DO NOTHING;
INSERT INTO carrera (nombre)
SELECT DISTINCT carrera FROM coordinador_carrera WHERE carrera IS NOT NULL AND btrim(carrera) <> ''
ON CONFLICT DO NOTHING;

ALTER TABLE estudiante ADD CONSTRAINT fk_estudiante_carrera
    FOREIGN KEY (carrera) REFERENCES carrera(nombre);
ALTER TABLE coordinador_carrera ADD CONSTRAINT fk_coordinador_carrera_catalogo
    FOREIGN KEY (carrera) REFERENCES carrera(nombre);
