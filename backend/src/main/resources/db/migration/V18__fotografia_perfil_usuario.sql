CREATE TABLE foto_perfil_usuario (
    username VARCHAR(120) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('ESTUDIANTE', 'COORDINADOR', 'JEFE_COORDINADORES')),
    contenido BYTEA NOT NULL,
    tipo_contenido VARCHAR(30) NOT NULL CHECK (tipo_contenido IN ('image/png', 'image/jpeg')),
    actualizada_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (username, rol)
);
