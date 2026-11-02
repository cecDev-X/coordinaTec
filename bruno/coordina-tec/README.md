# CoordinaTec API en Bruno

Abre `bruno/coordina-tec` con **Open Collection** y selecciona el entorno **Local** (`http://localhost:8080`). La colección contiene las 18 rutas HTTP del backend actual.

## Preparación

Desde la raíz del repositorio, inicia PostgreSQL y el backend para aplicar las migraciones pendientes:

```sh
docker compose up -d --build spring-backend
```

Para tener registros ficticios con los que probar las citas, carga una vez el seed local:

```sh
docker compose exec -T postgres-db psql -X -v ON_ERROR_STOP=1 -U coordina_admin -d coordina_tec_db < database/seed-dev.sql
```

Si tu terminal está en `backend/`, usa `< ../database/seed-dev.sql`. El backend permite solicitudes a `/api/v1/**` sin autenticación en su configuración actual. Las credenciales `estudiante` / `12345` de `POST /auth/login` solo generan un token simulado; no se usa en las otras solicitudes.

## Flujo de citas

El entorno **Local** incluye el RFC del coordinador, número de control, folio de formato y folio de cita del seed. Ejecuta **Agendar cita** y después **Consultar cita** y **Citas de estudiante**: el folio nuevo se guarda temporalmente en Bruno. Si ejecutas solo una consulta, se usa `CIT-DEMO-001`. La creación exige `fecha`, `horaInicio`, `coordinadorRfc`, `numControlEstudiante` y `formatoFolio`; el backend calcula `horaFin` con la duración del trámite asociado al formato.

**Listar citas de administración** devuelve todas las citas con folio, estudiante, carrera, tipo de trámite, fecha, hora y estado para la pantalla administrativa.

**Catálogos para formulario de cita** muestra las opciones actuales de estudiantes, coordinadores, formatos y trámites disponibles en la base.

En **Lista de Citas Actuales**, «Marcar atendida» guarda estado y fecha/hora de atención. Solo se permite para citas `PROGRAMADA`; V2 añade `fecha_atencion`. Las citas que ya estaban atendidas antes de V2 no tienen fecha histórica.

Después de **Agendar cita**, ejecuta **Marcar cita atendida** para cambiar la nueva cita de `PROGRAMADA` a `ATENDIDA`. Si ejecutas esta solicitud aislada, usará el folio del seed (`CIT-DEMO-001`) y cambiará ese registro local; no podrá volver a marcarse si ya está `ATENDIDA`.

## CRUD de tipos de trámite

Las solicitudes de la carpeta **Tramites** prueban listar, crear, consultar, actualizar y eliminar. Ejecuta la carpeta en orden: **Crear tipo de trámite** guarda el id generado en una variable temporal y **Eliminar tipo de trámite creado** borra ese registro de prueba al final. El catálogo `tramite` configura tipos, periodo, duración, requisitos y prioridad; cada `formato` referencia uno de esos tipos.

La duración está expresada en minutos y se configura en **Configuración de Trámites**. V4 relaciona cada formato con un tipo de trámite; al crear una cita, el servidor calcula la hora de fin con la duración de ese tipo y el body no necesita incluir `horaFin`.

Las rutas de horarios, disponibilidad y departamentos, así como la autenticación, aún devuelven respuestas simuladas. Las citas sí se guardan en PostgreSQL. Si solo quieres consultar datos, ejecuta las solicitudes GET individualmente: **Agendar cita** crea una fila nueva cada vez que se envía.
