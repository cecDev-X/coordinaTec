ALTER TABLE coordinador
    ADD COLUMN jefe_username VARCHAR(120) UNIQUE
    REFERENCES jefe_coordinadores(username) ON DELETE CASCADE;
