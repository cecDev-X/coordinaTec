CREATE TABLE coordinador_carrera (
    coordinador_rfc VARCHAR(13) NOT NULL REFERENCES coordinador(rfc) ON DELETE CASCADE,
    carrera VARCHAR(100) NOT NULL,
    PRIMARY KEY (coordinador_rfc, carrera)
);

CREATE INDEX idx_coordinador_carrera_carrera ON coordinador_carrera(carrera);
