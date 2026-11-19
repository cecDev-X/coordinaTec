package mx.tecnm.oaxaca.coordinatec.notifications;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository.ConfirmacionCita;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CitaConfirmationEmailService {
    private static final Logger log = LoggerFactory.getLogger(CitaConfirmationEmailService.class);
    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", Locale.forLanguageTag("es-MX"));
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH:mm");
    private final String apiKey;
    private final String sender;
    private final URI endpoint;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

    public CitaConfirmationEmailService(
        @Value("${RESEND_API_KEY:}") String apiKey,
        @Value("${COORDINATEC_MAIL_FROM:CoordinaTec <bienvenida@correo.coordinatec.site>}") String sender,
        @Value("${coordinatec.mail.api-url:https://api.resend.com/emails}") String apiUrl
    ) {
        this.apiKey = apiKey;
        this.sender = sender;
        this.endpoint = URI.create(apiUrl);
    }

    @Async("welcomeMailExecutor")
    public void enviarConfirmacion(ConfirmacionCita cita) {
        if (apiKey.isBlank() || cita.correo() == null || cita.correo().isBlank()) return;
        String fecha = cita.fecha().format(FECHA);
        String horario = cita.horaInicio().format(HORA) + "–" + cita.horaFin().format(HORA);
        try {
            String body = mapper.writeValueAsString(Map.of(
                "from", sender,
                "to", List.of(cita.correo()),
                "subject", "Cita confirmada · " + cita.folio() + " | CoordinaTec",
                "text", """
                    ¡Hola, %s!

                    Tu cita en CoordinaTec se registró con éxito y está confirmada.

                    Folio: %s
                    Trámite: %s
                    Fecha: %s
                    Horario: %s
                    Te atenderá: %s

                    Consulta los detalles en https://coordinatec.site
                    Te recomendamos llegar unos minutos antes con tu credencial y los documentos necesarios para tu trámite.

                    Equipo CoordinaTec
                    Instituto Tecnológico de Oaxaca
                    """.formatted(cita.nombres(), cita.folio(), cita.tramite(), fecha, horario, cita.coordinador()),
                "html", """
                    <!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
                    <body style="margin:0;padding:24px 12px;background:#f1f5fb;font-family:Arial,Helvetica,sans-serif;color:#1c2d49;">
                      <div style="max-width:600px;margin:auto;background:white;border:1px solid #dce5f2;border-radius:16px;overflow:hidden;">
                        <div style="padding:28px 32px;background:#203a70;color:white;">
                          <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;">TECNM · INSTITUTO TECNOLÓGICO DE OAXACA</p>
                          <h1 style="margin:0;font-size:25px;">¡Tu cita está confirmada!</h1>
                        </div>
                        <div style="padding:30px 32px;font-size:16px;line-height:1.6;">
                          <p>¡Hola, <strong>%s</strong>! Tu cita en CoordinaTec se registró con éxito.</p>
                          <div style="padding:16px 20px;background:#f3f6fc;border-radius:10px;">
                            <p style="margin:5px 0;"><strong>Folio:</strong> %s</p>
                            <p style="margin:5px 0;"><strong>Trámite:</strong> %s</p>
                            <p style="margin:5px 0;"><strong>Fecha:</strong> %s</p>
                            <p style="margin:5px 0;"><strong>Horario:</strong> %s</p>
                            <p style="margin:5px 0;"><strong>Te atenderá:</strong> %s</p>
                          </div>
                          <p>Te recomendamos llegar unos minutos antes con tu credencial y los documentos necesarios para tu trámite.</p>
                          <p><a href="https://coordinatec.site" style="display:inline-block;padding:13px 24px;border-radius:8px;background:#254a91;color:white;text-decoration:none;font-weight:bold;">Ver mis citas</a></p>
                        </div>
                        <div style="padding:18px 32px;background:#f6f8fc;font-size:13px;color:#596b86;">Equipo CoordinaTec · Instituto Tecnológico de Oaxaca</div>
                      </div>
                    </body></html>
                    """.formatted(escapar(cita.nombres()), escapar(cita.folio()), escapar(cita.tramite()),
                    escapar(fecha), escapar(horario), escapar(cita.coordinador()))
            ));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("No se pudo enviar la confirmación de la cita: Resend respondió HTTP {}", response.statusCode());
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Se interrumpió el envío de confirmación de cita");
        } catch (Exception exception) {
            log.warn("No se pudo enviar la confirmación de la cita: {}", exception.getMessage());
        }
    }

    @Async("welcomeMailExecutor")
    public void enviarCancelacion(ConfirmacionCita cita) {
        if (apiKey.isBlank() || cita.correo() == null || cita.correo().isBlank()) return;
        String fecha = cita.fecha().format(FECHA);
        String horario = cita.horaInicio().format(HORA) + "–" + cita.horaFin().format(HORA);
        try {
            String body = mapper.writeValueAsString(Map.of(
                "from", sender,
                "to", List.of(cita.correo()),
                "subject", "Cita cancelada · " + cita.folio() + " | CoordinaTec",
                "text", """
                    Hola, %s:

                    Tu cita ha sido cancelada. Ya no debes acudir en la fecha y horario indicados.

                    Folio: %s
                    Trámite: %s
                    Fecha: %s
                    Horario: %s
                    Coordinación: %s

                    Si necesitas otra cita, puedes agendarla en https://coordinatec.site

                    Equipo CoordinaTec
                    """.formatted(cita.nombres(), cita.folio(), cita.tramite(), fecha, horario, cita.coordinador()),
                "html", """
                    <!doctype html><html lang="es"><head><meta charset="utf-8"></head>
                    <body style="padding:24px;background:#f1f5fb;font-family:Arial,Helvetica,sans-serif;color:#1c2d49;">
                      <div style="max-width:600px;margin:auto;background:white;border-radius:16px;overflow:hidden;">
                        <div style="padding:28px;background:#203a70;color:white;"><h1 style="margin:0;font-size:24px;">Tu cita fue cancelada</h1></div>
                        <div style="padding:28px;line-height:1.6;">
                          <p>Hola, <strong>%s</strong>. Tu cita ha sido cancelada. Ya no debes acudir en la fecha y horario indicados.</p>
                          <p><strong>Folio:</strong> %s<br><strong>Trámite:</strong> %s<br><strong>Fecha:</strong> %s<br>
                          <strong>Horario:</strong> %s<br><strong>Coordinación:</strong> %s</p>
                          <p>Si necesitas otra cita, <a href="https://coordinatec.site">puedes agendarla aquí</a>.</p>
                        </div>
                      </div>
                    </body></html>
                    """.formatted(escapar(cita.nombres()), escapar(cita.folio()), escapar(cita.tramite()),
                    escapar(fecha), escapar(horario), escapar(cita.coordinador()))
            ));
            HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(5))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("No se pudo enviar la cancelación de la cita: Resend respondió HTTP {}", response.statusCode());
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            log.warn("Se interrumpió el envío de cancelación de cita");
        } catch (Exception exception) {
            log.warn("No se pudo enviar la cancelación de la cita: {}", exception.getMessage());
        }
    }

    private static String escapar(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
