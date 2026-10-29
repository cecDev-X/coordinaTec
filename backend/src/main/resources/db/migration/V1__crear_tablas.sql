-- Esquema inicial del modelo relacional de CoordinaTec.
-- Los identificadores sin comillas del modelo (numeroControl, estudiante_numeroControl)
-- se convierten a minúsculas en PostgreSQL.

CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    nombre_area VARCHAR(150) NOT NULL
);

CREATE TABLE estudiante (
    numerocontrol VARCHAR(15) PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE formato (
    folio VARCHAR(50) PRIMARY KEY,
    asunto VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_tramite VARCHAR(100) NOT NULL,
    observaciones TEXT
);

CREATE TABLE coordinador (
    rfc VARCHAR(13) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    departamento_id INT NOT NULL,
    CONSTRAINT fk_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id)
        ON DELETE RESTRICT
);

CREATE TABLE horario (
    id SERIAL PRIMARY KEY,
    dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
    hora_inicio TIME NOT NULL,
    hora_salida TIME NOT NULL,
    duracion_minutos INT NOT NULL CHECK (duracion_minutos > 0),
    coordinador_rfc VARCHAR(13) NOT NULL,
    CONSTRAINT chk_horario_horas CHECK (hora_salida > hora_inicio),
    CONSTRAINT fk_horario_coordinador
        FOREIGN KEY (coordinador_rfc)
        REFERENCES coordinador(rfc)
        ON DELETE CASCADE
);

CREATE TABLE bloqueo_calendario (
    id SERIAL PRIMARY KEY,
    fecha_bloqueada DATE NOT NULL,
    motivo VARCHAR(200),
    coordinador_rfc VARCHAR(13) NOT NULL,
    CONSTRAINT fk_bloqueo_coordinador
        FOREIGN KEY (coordinador_rfc)
        REFERENCES coordinador(rfc)
        ON DELETE CASCADE
);

CREATE TABLE cita (
    folio VARCHAR(50) PRIMARY KEY,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_programada DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    motivo TEXT,
    coordinador_rfc VARCHAR(13) NOT NULL,
    estudiante_numerocontrol VARCHAR(15) NOT NULL,
    formato_folio VARCHAR(50) NOT NULL,
    CONSTRAINT chk_cita_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT fk_cita_coordinador
        FOREIGN KEY (coordinador_rfc)
        REFERENCES coordinador(rfc)
        ON DELETE RESTRICT,
    CONSTRAINT fk_cita_estudiante
        FOREIGN KEY (estudiante_numerocontrol)
        REFERENCES estudiante(numerocontrol)
        ON DELETE RESTRICT,
    CONSTRAINT fk_cita_formato
        FOREIGN KEY (formato_folio)
        REFERENCES formato(folio)
        ON DELETE RESTRICT
);

CREATE INDEX idx_coordinador_depto ON coordinador(departamento_id);
CREATE INDEX idx_horario_coord ON horario(coordinador_rfc);
CREATE INDEX idx_bloqueo_coord_fecha ON bloqueo_calendario(coordinador_rfc, fecha_bloqueada);
CREATE INDEX idx_cita_coord_fecha ON cita(coordinador_rfc, fecha_programada);
CREATE INDEX idx_cita_estudiante ON cita(estudiante_numerocontrol);
CREATE INDEX idx_cita_formato ON cita(formato_folio);
