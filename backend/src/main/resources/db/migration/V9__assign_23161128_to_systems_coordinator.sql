UPDATE cita c
SET coordinador_rfc = target.coordinador_rfc
FROM estudiante e
JOIN LATERAL (
    SELECT cc.coordinador_rfc
    FROM coordinador_carrera cc
    JOIN coordinador assigned ON assigned.rfc = cc.coordinador_rfc
    WHERE cc.carrera = e.carrera
      AND assigned.jefe_username IS NULL
    ORDER BY (assigned.nombre_completo ILIKE '%Sistemas%') DESC, assigned.nombre_completo
    LIMIT 1
) target ON TRUE
WHERE c.estudiante_numerocontrol = e.numerocontrol
  AND e.numerocontrol = '23161128'
  AND c.coordinador_rfc = 'DEMO000000001';
