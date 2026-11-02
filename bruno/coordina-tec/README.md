# CoordinaTec API en Bruno

Abre `bruno/coordina-tec` con **Open Collection** y selecciona el entorno **Local** (`http://localhost:8080`). La colección contiene las doce rutas HTTP del backend actual.

## Preparación

Desde la raíz del repositorio, inicia PostgreSQL y el backend para aplicar la migración V1:

```sh
docker compose up -d --build spring-backend
```

Para tener registros ficticios con los que probar las citas, carga una vez el seed local:

```sh
docker compose exec -T postgres-db psql -X -v ON_ERROR_STOP=1 -U coordina_admin -d coordina_tec_db < database/seed-dev.sql
```

Si tu terminal está en `backend/`, usa `< ../database/seed-dev.sql`. El backend permite solicitudes a `/api/v1/**` sin autenticación en su configuración actual. Las credenciales `estudiante` / `12345` de `POST /auth/login` solo generan un token simulado; no se usa en las otras solicitudes.

## Flujo de citas

El entorno **Local** incluye el RFC del coordinador, número de control, folio de formato y folio de cita del seed. Ejecuta **Agendar cita** y después **Consultar cita** y **Citas de estudiante**: el folio nuevo se guarda temporalmente en Bruno. Si ejecutas solo una consulta, se usa `CIT-DEMO-001`. La creación devuelve la entidad guardada y exige `fecha`, `horaInicio`, `horaFin`, `coordinadorRfc`, `numControlEstudiante` y `formatoFolio`.

**Listar citas de administración** devuelve todas las citas con folio, estudiante, carrera, tipo de trámite, fecha, hora y estado para la pantalla administrativa.

Después de **Agendar cita**, ejecuta **Marcar cita atendida** para cambiar la nueva cita de `PROGRAMADA` a `ATENDIDA`. Si ejecutas esta solicitud aislada, usará el folio del seed (`CIT-DEMO-001`) y cambiará ese registro local; no podrá volver a marcarse si ya está `ATENDIDA`.

Las rutas de horarios, disponibilidad y departamentos, así como la autenticación, aún devuelven respuestas simuladas. Las citas sí se guardan en PostgreSQL. Si solo quieres consultar datos, ejecuta las solicitudes GET individualmente: **Agendar cita** crea una fila nueva cada vez que se envía.
