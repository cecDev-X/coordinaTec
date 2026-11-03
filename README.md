2 personas trabajarán en backend
2 en frontend
2 en la bd

## Base de datos y migraciones

El esquema inicial del modelo relacional está en
`backend/src/main/resources/db/migration/V1__crear_tablas.sql`. Flyway aplica las
migraciones pendientes al iniciar el backend y registra cada versión en
`flyway_schema_history`; después Hibernate valida las entidades sin modificar
el esquema. `V2__registrar_fecha_atencion.sql` agrega el momento real en que se
atiende una cita. Las citas atendidas antes de V2 conservan ese dato vacío porque
no es posible reconstruir su fecha histórica. `V3__crear_catalogo_tramites.sql`
crea el catálogo administrable de tipos de trámite. `V4__duracion_y_tipo_de_tramite_en_formato.sql`
agrega la duración en minutos y vincula los formatos con su tipo de trámite;
los formatos existentes reciben inicialmente 20 minutos y la duración se puede
ajustar desde Configuración de Trámites. El backend calcula la hora de fin de cada
nueva cita con esa duración. Para cambios futuros,
agrega `V5__descripcion.sql`, etc. No modifiques una migración que ya se haya
aplicado a una base de datos.

El catálogo se administra con el CRUD de `/api/v1/tramites` y guarda nombre,
periodo en días, duración de cita en minutos, requisitos, estatus activo y
prioridad. Es distinto de la tabla `formato`, que guarda documentos específicos
asociados a citas y referencia un tipo del catálogo.

`database/coordinatecdcl.sql` define roles de grupo para PostgreSQL y se ejecuta
manualmente después de las migraciones, con permisos de administrador. No crea
usuarios de aplicación ni activa autorización por rol en Spring; `SecurityConfig`
y el login siguen siendo de desarrollo y deben conectarse a esos roles en una
implementación posterior.

Desde la raíz del repositorio:

```sh
docker compose up -d postgres-db
docker compose up -d --build spring-backend
docker compose exec -T postgres-db psql -U coordina_admin -d coordina_tec_db -c '\dt'
docker compose exec -T postgres-db psql -U coordina_admin -d coordina_tec_db -c 'SELECT version, description, success FROM flyway_schema_history;'
```

PostgreSQL publica el puerto 5432 del host por defecto. Si ya lo usa otra
instalación local, configura `POSTGRES_HOST_PORT=5433` en un archivo `.env` en
la raíz antes de levantar Compose; dentro de los contenedores sigue siendo 5432.
Para ejecutar el backend desde el host, configura las variables
`SPRING_DATASOURCE_URL` (con el puerto publicado), `SPRING_DATASOURCE_USERNAME`
y `SPRING_DATASOURCE_PASSWORD` antes de usar Maven en `backend/`.

Los scripts de `database/` quedan como referencia del diseño original;
`database/coordinatecdml.sql` contiene ejemplos de datos y operaciones, y no
se ejecuta automáticamente. Para guardar una cita deben existir previamente
el estudiante, coordinador y formato indicados por sus llaves foráneas.

### Datos ficticios para desarrollo

Después de arrancar el backend y aplicar las migraciones pendientes, cada integrante
puede cargar opcionalmente los mismos ejemplos en su propia base local:

```sh
docker compose exec -T postgres-db psql -X -v ON_ERROR_STOP=1 -U coordina_admin -d coordina_tec_db < database/seed-dev.sql
```

`database/seed-dev.sql` no forma parte de las migraciones automáticas: se
comparte en Git, pero cada persona elige si lo ejecuta. Crea un departamento,
un estudiante (`DEMO0001`), un coordinador (`DEMO000000001`), un formato
(`FMT-DEMO-001`), una cita (`CIT-DEMO-001`) y cinco tipos de trámite, además
de un horario y un bloqueo. Se puede volver a ejecutar después de V4 para añadir
los trámites de demostración a una base que ya tenía los demás datos.
Se puede ejecutar más de una vez sin duplicar esos registros. Los valores de
`password_hash` son solo marcadores, no credenciales válidas.
