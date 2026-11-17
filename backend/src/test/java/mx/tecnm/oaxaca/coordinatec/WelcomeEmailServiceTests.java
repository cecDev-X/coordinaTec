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
            assertThat(body.get("subject").asText()).contains("Bienvenido a CoordinaTec");
            assertThat(body.get("text").asText()).contains("¡Hola, José!", "https://coordinatec.site", "Nunca compartas tu contraseña");
            assertThat(body.get("html").asText()).contains("¡Hola, <strong>José</strong>!", "Ir al portal estudiantil");
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
    void escapaElNombreEnLaVersionHtml() throws Exception {
        AtomicReference<String> payload = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            payload.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();
        try {
            new WelcomeEmailService("clave-de-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/emails")
                .enviarBienvenida("Ana <script>", "alumno@ejemplo.com");
            String html = new ObjectMapper().readTree(payload.get()).get("html").asText();
            assertThat(html).contains("Ana &lt;script&gt;").doesNotContain("Ana <script>");
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

    @Test
    void enviaEnlaceDeRecuperacionSinIncluirPasswordNiTokenEnLogs() throws Exception {
        AtomicReference<String> payload = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            payload.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();
        try {
            WelcomeEmailService service = new WelcomeEmailService("clave-de-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/emails");
            assertThat(service.enviarRecuperacion("Ana", "alumno@ejemplo.com", "23160887", "token-seguro"))
                .isTrue();
            JsonNode body = new ObjectMapper().readTree(payload.get());
            assertThat(body.get("text").asText()).contains("https://coordinatec.site/#/estudiante/restablecer?token=token-seguro", "30 minutos");
            assertThat(body.get("html").asText()).contains("Crear nueva contraseña");
            assertThat(payload.get()).doesNotContain("clave-de-prueba");
        } finally {
            server.stop(0);
        }
    }
}
