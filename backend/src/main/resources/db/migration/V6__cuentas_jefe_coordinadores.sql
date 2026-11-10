CREATE TABLE jefe_coordinadores (
    username VARCHAR(120) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE coordinador ADD COLUMN username VARCHAR(120);
UPDATE coordinador SET username = rfc WHERE username IS NULL;
ALTER TABLE coordinador ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX uq_coordinador_username ON coordinador(username);
