package mx.tecnm.oaxaca.coordinatec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import mx.tecnm.oaxaca.coordinatec.notifications.WelcomeEmailService;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class WelcomeEmailServiceTests {

    @Test
    void enviaBienvenidaPorResendSinExponerLaClaveEnElMensaje() throws Exception {
        AtomicReference<String> authorization = new AtomicReference<>();
        AtomicReference<String> payload = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            payload.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();
        try {
            String endpoint = "http://127.0.0.1:" + server.getAddress().getPort() + "/emails";
            new WelcomeEmailService("clave-de-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>", endpoint)
                .enviarBienvenida("José", "alumno@ejemplo.com");

            assertThat(authorization.get()).isEqualTo("Bearer clave-de-prueba");
            JsonNode body = new ObjectMapper().readTree(payload.get());
            assertThat(body.get("from").asText()).isEqualTo("CoordinaTec <bienvenida@correo.coordinatec.site>");
            assertThat(body.get("to").get(0).asText()).isEqualTo("alumno@ejemplo.com");
            assertThat(body.get("text").asText()).contains("Hola José", "Tu cuenta estudiantil");
            assertThat(payload.get()).doesNotContain("clave-de-prueba");

            authorization.set(null);
            new WelcomeEmailService("", "CoordinaTec <bienvenida@correo.coordinatec.site>", endpoint)
                .enviarBienvenida("José", "alumno@ejemplo.com");
            assertThat(authorization.get()).isNull();
        } finally {
            server.stop(0);
        }
    }

    @Test
    void falloDeResendNoLanzaErrorAlRegistro() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            exchange.sendResponseHeaders(500, -1);
            exchange.close();
        });
        server.start();
        try {
            WelcomeEmailService service = new WelcomeEmailService(
                "clave-de-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/emails");
            assertThatCode(() -> service.enviarBienvenida("Ana", "alumno@ejemplo.com")).doesNotThrowAnyException();
        } finally {
            server.stop(0);
        }
    }
}
