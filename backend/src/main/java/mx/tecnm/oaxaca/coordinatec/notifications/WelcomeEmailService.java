package mx.tecnm.oaxaca.coordinatec.notifications;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class WelcomeEmailService {

    private static final Logger log = LoggerFactory.getLogger(WelcomeEmailService.class);
    private final String apiKey;
    private final String sender;
    private final URI endpoint;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client;

    public WelcomeEmailService(
        @Value("${RESEND_API_KEY:}") String apiKey,
        @Value("${COORDINATEC_MAIL_FROM:CoordinaTec <bienvenida@correo.coordinatec.site>}") String sender,
        @Value("${coordinatec.mail.api-url:https://api.resend.com/emails}") String apiUrl
    ) {
        this.apiKey = apiKey;
        this.sender = sender;
        this.endpoint = URI.create(apiUrl);
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    }

    @Async("welcomeMailExecutor")
    public void enviarBienvenida(String nombres, String correo) {
        if (apiKey.isBlank()) {
            log.info("Correo de bienvenida desactivado: RESEND_API_KEY no está configurada");
            return;
        }

        try {
            String nombreSeguro = escaparHtml(nombres);
            String body = mapper.writeValueAsString(Map.of(
                "from", sender,
                "to", List.of(correo),
                "subject", "¡Bienvenido a CoordinaTec! Tu cuenta está lista",
                "text", """
                    ¡Hola, %s!

                    Nos alegra darte la bienvenida a CoordinaTec, el portal estudiantil del Instituto Tecnológico de Oaxaca. Tu cuenta ya está lista.

                    Desde el portal puedes consultar los trámites disponibles para tu carrera, revisar los horarios de atención y agendar citas con tu coordinación.

                    Ingresa con tu número de control y la contraseña que elegiste:
                    https://coordinatec.site

                    Gracias por formar parte de nuestra comunidad. ¡Te deseamos mucho éxito en tus trámites!

                    Si no reconoces este registro, puedes ignorar este mensaje. Nunca compartas tu contraseña.

                    Equipo CoordinaTec
                    Instituto Tecnológico de Oaxaca
                    """.formatted(nombres),
                "html", """
                    <!doctype html>
                    <html lang="es">
                      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                      <body style="margin:0;padding:24px 12px;background:#f1f5fb;font-family:Arial,Helvetica,sans-serif;color:#1c2d49;">
                        <div style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #dce5f2;border-radius:16px;overflow:hidden;">
                          <div style="padding:28px 32px;background:#203a70;color:#ffffff;">
                            <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;">TECNM · INSTITUTO TECNOLÓGICO DE OAXACA</p>
                            <h1 style="margin:0;font-size:26px;line-height:1.3;">¡Bienvenido a CoordinaTec!</h1>
                          </div>
                          <div style="padding:30px 32px;font-size:16px;line-height:1.65;">
                            <p style="margin:0 0 16px;">¡Hola, <strong>%s</strong>!</p>
                            <p>Nos alegra darte la bienvenida. Tu cuenta estudiantil ya está lista y puedes comenzar a gestionar tus trámites académicos desde un solo lugar.</p>
                            <p style="margin:24px 0 10px;"><strong>Desde el portal puedes:</strong></p>
                            <ul style="padding-left:22px;margin:0 0 26px;">
                              <li>Consultar los trámites disponibles para tu carrera.</li>
                              <li>Revisar los horarios de atención de tu coordinación.</li>
                              <li>Agendar y consultar tus citas.</li>
                            </ul>
                            <p>Ingresa con tu número de control y la contraseña que elegiste:</p>
                            <p style="margin:26px 0;"><a href="https://coordinatec.site" style="display:inline-block;padding:13px 24px;border-radius:8px;background:#254a91;color:#ffffff;text-decoration:none;font-weight:bold;">Ir al portal estudiantil</a></p>
                            <p>Gracias por formar parte de nuestra comunidad. ¡Te deseamos mucho éxito en tus trámites!</p>
                            <p style="margin:26px 0 0;font-size:13px;color:#596b86;">Si no reconoces este registro, puedes ignorar este mensaje. Nunca compartas tu contraseña.</p>
                          </div>
                          <div style="padding:18px 32px;background:#f6f8fc;font-size:13px;color:#596b86;">
                            Equipo CoordinaTec · Instituto Tecnológico de Oaxaca<br>
                            <a href="https://coordinatec.site" style="color:#254a91;">coordinatec.site</a>
                          </div>
                        </div>
                      </body>
                    </html>
                    """.formatted(nombreSeguro)
            ));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("No se pudo enviar el correo de bienvenida: Resend respondió HTTP {}", response.statusCode());
            }
        } catch (JsonProcessingException exception) {
            log.warn("No se pudo preparar el correo de bienvenida", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Se interrumpió el envío del correo de bienvenida");
        } catch (IOException | RuntimeException exception) {
            log.warn("No se pudo enviar el correo de bienvenida: {}", exception.getMessage());
        }
    }

    public boolean disponible() {
        return !apiKey.isBlank();
    }

    public boolean enviarRecuperacion(String nombres, String correo, String numControl, String token) {
        if (!disponible()) return false;
        String enlace = "https://coordinatec.site/#/estudiante/restablecer?token=" + token;
        try {
            String body = mapper.writeValueAsString(Map.of(
                "from", sender,
                "to", List.of(correo),
                "subject", "Restablece tu contraseña de CoordinaTec",
                "text", "Hola " + nombres + ",\n\nRecibimos una solicitud para cambiar la contraseña "
                    + "de la cuenta " + numControl + ". Abre este enlace para elegir una contraseña nueva:\n\n"
                    + enlace + "\n\nEste enlace es válido durante 30 minutos y solo se puede usar una vez. "
                    + "Si no solicitaste el cambio, ignora este mensaje; tu contraseña seguirá igual.\n\nEquipo CoordinaTec",
                "html", """
                    <!doctype html><html lang="es"><head><meta charset="utf-8"></head>
                    <body style="background:#f1f5fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1c2d49;">
                      <div style="max-width:600px;margin:auto;background:white;border-radius:16px;overflow:hidden;">
                        <div style="padding:28px;background:#203a70;color:white;"><h1 style="margin:0;font-size:24px;">Restablece tu contraseña</h1></div>
                        <div style="padding:28px;line-height:1.6;">
                          <p>¡Hola, <strong>%s</strong>!</p>
                          <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta <strong>%s</strong> en CoordinaTec.</p>
                          <p><a href="%s" style="display:inline-block;padding:13px 20px;background:#254a91;color:white;border-radius:8px;text-decoration:none;">Crear nueva contraseña</a></p>
                          <p>El enlace vence en <strong>30 minutos</strong> y solo se puede usar una vez.</p>
                          <p style="font-size:13px;color:#596b86;">Si no solicitaste este cambio, ignora este mensaje. Tu contraseña seguirá igual y nunca debes compartirla.</p>
                        </div>
                      </div>
                    </body></html>
                    """.formatted(escaparHtml(nombres), escaparHtml(numControl), enlace)
            ));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() >= 200 && response.statusCode() < 300) return true;
            log.warn("No se pudo enviar el enlace de recuperación: Resend respondió HTTP {}", response.statusCode());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Se interrumpió el envío de recuperación");
        } catch (IOException | RuntimeException exception) {
            log.warn("No se pudo enviar el enlace de recuperación: {}", exception.getMessage());
        }
        return false;
    }

    private static String escaparHtml(String texto) {
        return texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
