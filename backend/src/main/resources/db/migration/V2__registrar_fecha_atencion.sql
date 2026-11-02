ALTER TABLE cita
    ADD COLUMN fecha_atencion TIMESTAMP WITH TIME ZONE;

-- Las citas ya atendidas antes de esta migración conservan fecha_atencion en NULL,
-- porque el sistema no guardaba cuándo se realizó la atención.
