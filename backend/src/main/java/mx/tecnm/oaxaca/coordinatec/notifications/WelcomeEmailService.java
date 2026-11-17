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
            String body = mapper.writeValueAsString(Map.of(
                "from", sender,
                "to", List.of(correo),
                "subject", "Bienvenido a CoordinaTec",
                "text", "Hola " + nombres + ",\n\nTu cuenta estudiantil de CoordinaTec ya está registrada. "
                    + "Puedes iniciar sesión para consultar tus trámites y agendar citas.\n\n"
                    + "Si no creaste esta cuenta, puedes ignorar este mensaje.\n\nEquipo CoordinaTec"
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
}
