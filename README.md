2 personas trabajarán en backend
2 en frontend
2 en la bd

## Base de datos y migraciones

El esquema inicial del modelo relacional está en
`backend/src/main/resources/db/migration/V1__crear_tablas.sql`. Al iniciar el backend,
Flyway crea las siete tablas y registra la versión en `flyway_schema_history`;
después Hibernate valida la entidad `CitaEntity` sin modificar el esquema.
Para cambios futuros, agrega un nuevo archivo `V2__descripcion.sql`, etc., en esa
carpeta. No modifiques una migración que ya se haya aplicado a una base de datos.

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

Después de arrancar el backend y aplicar V1, cada integrante puede cargar
opcionalmente los mismos ejemplos en su propia base local:

```sh
docker compose exec -T postgres-db psql -X -v ON_ERROR_STOP=1 -U coordina_admin -d coordina_tec_db < database/seed-dev.sql
```

`database/seed-dev.sql` no forma parte de las migraciones automáticas: se
comparte en Git, pero cada persona elige si lo ejecuta. Crea un departamento,
un estudiante (`DEMO0001`), un coordinador (`DEMO000000001`), un formato
(`FMT-DEMO-001`) y una cita (`CIT-DEMO-001`), además de un horario y un bloqueo.
Se puede ejecutar más de una vez sin duplicar esos registros. Los valores de
`password_hash` son solo marcadores, no credenciales válidas.
