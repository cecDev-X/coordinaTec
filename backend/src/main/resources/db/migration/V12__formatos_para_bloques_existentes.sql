-- Los bloques ya guardados deben poder reservarse aunque nadie haya creado un formato manualmente.
INSERT INTO formato (folio, asunto, tipo_tramite, observaciones, tramite_id)
SELECT 'AUTO-TRAMITE-' || t.id, LEFT(t.nombre, 150), LEFT(t.nombre, 100),
       'Formato generado automáticamente para agendar citas', t.id
FROM tramite t
WHERE t.activo = TRUE
  AND EXISTS (SELECT 1 FROM horario_tramite ht WHERE ht.tramite_id = t.id)
  AND NOT EXISTS (SELECT 1 FROM formato f WHERE f.tramite_id = t.id)
ON CONFLICT (folio) DO NOTHING;
