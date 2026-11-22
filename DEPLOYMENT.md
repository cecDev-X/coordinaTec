# Despliegue en VPS: coordinatec.site

La configuración de producción es independiente del `docker-compose.yml` de desarrollo.
Sirve el portal de estudiantes en `https://coordinatec.site` (PWA) y el panel web en
`https://admin.coordinatec.site`. Ambos usan la misma API y PostgreSQL internos.

## Preparación

- Apuntar los registros DNS `A` de `@` y `admin` a la IP pública de la VPS. Si se usa
  `www`, su CNAME debe apuntar a `coordinatec.site`.
- Abrir únicamente TCP 80 y 443 para la web en el grupo de seguridad de AWS;
  restringir SSH 22 a direcciones autorizadas. Caddy obtiene y renueva los certificados
  HTTPS automáticamente. No abrir 5432 ni 8080.
- Reservar una IP estable (por ejemplo, Elastic IP): si la IP pública cambia, actualizar DNS.
- Desde el repositorio en la VPS, crear el archivo de secretos **solo en la VPS**:

  ```bash
  cp .env.production.example .env.production
  chmod 600 .env.production
  openssl rand -hex 32   # generar una contraseña para PostgreSQL
  openssl rand -hex 32   # generar un secreto JWT diferente
  ```

  Reemplazar los dos valores de ejemplo por valores distintos y configurar una cuenta
  inicial de Jefatura (`COORDINATEC_BOOTSTRAP_ADMIN_USERNAME` y una contraseña de al
  menos 12 caracteres). No pegar secretos en chats ni subir `.env.production` a Git.
  En bases de datos ya pobladas, dejar las variables bootstrap vacías.

## Arranque y comprobación

```bash
sudo docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
sudo docker compose --env-file .env.production -f docker-compose.production.yml ps
sudo docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=100 proxy spring-backend
```

Abrir ambos dominios con HTTPS y confirmar que en el administrador no aparece
la opción de instalar la PWA. En el portal estudiantil verificar el manifiesto,
la instalación en un navegador móvil y que **las reservas necesitan conexión**.
El service worker solo almacena la interfaz estática; nunca respuestas de `/api/`.

Tras el primer inicio de sesión, **quitar las dos variables bootstrap** de
`.env.production` y recrear el backend para retirarlas del entorno del contenedor:

```bash
sudo docker compose --env-file .env.production -f docker-compose.production.yml up -d --force-recreate spring-backend
```

Para actualizar: `git pull` y repetir `up -d --build` con el mismo archivo de
secretos. **No usar `down -v`**, pues eliminaría los datos. Programar copias de
seguridad del volumen de PostgreSQL antes de publicar datos reales.

## Correo de bienvenida (Resend)

El registro estudiantil guarda la cuenta aunque falle el correo de bienvenida. Si
`RESEND_API_KEY` no está definida, no intenta enviar mensajes. Para activar el envío:

1. Verificar `correo.coordinatec.site` en Resend (registros DNS DKIM y SPF).
2. Crear en Resend una API key con permiso de envío y limitarla al dominio verificado.
3. Añadir a `.env.production` **solo en la VPS** (sin subir la clave al repositorio):

   ```dotenv
   RESEND_API_KEY=la-clave-generada-en-resend
   COORDINATEC_MAIL_FROM="CoordinaTec <bienvenida@correo.coordinatec.site>"
   ```

4. Reconstruir y recrear el backend con el mismo comando de arranque de arriba.

El envío se realiza en segundo plano; los fallos se registran en los logs del backend.
No hay reintentos persistentes ni recuperación de correos pendientes tras reinicios.
Verificar el dominio para **enviar** no habilita una bandeja para recibir respuestas.

Al registrar una cita, también se manda al estudiante un correo de confirmación
con folio, trámite, fecha, horario y nombre de la persona coordinadora. Solo se
intenta si la cita quedó guardada y el estudiante tiene correo registrado.
La cita sigue confirmada aunque falle la notificación (no hay reintento automático).

Si el estudiante o coordinación cancela una cita programada, se conserva con
estado `CANCELADA`, se libera el horario y se envía un correo al estudiante con
los datos de la reserva. El estudiante solo puede cancelarla con más de una hora
de anticipación (hora de Oaxaca); coordinación y Jefatura pueden cancelar hasta
antes de su inicio. La inasistencia (`NO_ASISTIO`) solo puede marcarse después
de que termine la cita. Un fallo del correo no revierte la cancelación.

La campana del panel muestra las citas nuevas de la coordinación asignada y de
Jefatura. Las notificaciones se guardan en PostgreSQL mediante la migración V15,
se actualizan cada 30 segundos mientras el panel está abierto y dejan de contar
como pendientes cuando el destinatario las abre. Las citas anteriores a V15 no
generan notificaciones retroactivas.

La recuperación de contraseña usa el mismo servicio de Resend. El estudiante solicita
un enlace desde el inicio de sesión y recibe un token aleatorio de un solo uso que
vence en 30 minutos. El token solo se almacena como hash en PostgreSQL; se limita
la solicitud a una por cuenta cada 5 minutos y no se revela si el correo existe.
Las cuentas antiguas sin correo registrado deberán añadirlo mediante Jefatura antes
de poder usar la recuperación. Tras restablecer una contraseña, las sesiones JWT
existentes siguen vigentes hasta su vencimiento (máximo 8 horas).

No habilitar `COORDINATEC_DEMO_USERS_ENABLED` en producción. El catálogo inicial
puede estar vacío; agregar coordinadores y trámites desde el panel de Jefatura.

## Asistente estudiantil (Groq)

Crear una API key en Groq y colocar `GROQ_API_KEY=...` únicamente en `.env.production`
de la VPS. Compose la pasa solo al backend; reconstruir y recrear `spring-backend`
tras actualizar el repositorio. Sin clave, el asistente responde como no disponible.
El modelo por defecto es `openai/gpt-oss-20b`; puede cambiarse con
`COORDINATEC_GROQ_MODEL` si se configura en el entorno del backend.

El chat solo acepta sesiones de estudiantes y usa los trámites habilitados para su
carrera como referencia. No lee citas ni ejecuta cambios; las respuestas pueden
contener errores y deben contrastarse con coordinación. Se limita a 10 consultas
por estudiante/minuto, 20 consultas/minuto y 500 consultas/día por instancia
(los contadores se reinician al reiniciar el backend). El historial se envía
acotado y no se guarda en la base de datos. Consultar los límites vigentes en
Groq Console: podrían cambiar y la API puede responder 429.
