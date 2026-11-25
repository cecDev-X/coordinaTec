package mx.tecnm.oaxaca.coordinatec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import mx.tecnm.oaxaca.coordinatec.notifications.CitaConfirmationEmailService;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository.ConfirmacionCita;
import org.junit.jupiter.api.Test;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class CitaConfirmationEmailServiceTests {
    private final ConfirmacionCita cita = new ConfirmacionCita("FOL-PRUEBA", "Ana <script>",
        "estudiante@ejemplo.com", "Cambio de Carrera", "Coordinadora de Sistemas",
        LocalDate.of(2026, 11, 20), LocalTime.of(10, 0), LocalTime.of(10, 20));

    @Test
    void enviaLosDatosDeLaCitaYEscapaElNombreEnHtml() throws Exception {
        AtomicReference<String> body = new AtomicReference<>();
        AtomicReference<String> auth = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            auth.set(exchange.getRequestHeaders().getFirst("Authorization"));
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();
        try {
            new CitaConfirmationEmailService("clave-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/emails").enviarConfirmacion(cita);
            JsonNode json = new ObjectMapper().readTree(body.get());
            assertThat(auth.get()).isEqualTo("Bearer clave-prueba");
            assertThat(json.get("to").get(0).asText()).isEqualTo("estudiante@ejemplo.com");
            assertThat(json.get("subject").asText()).contains("FOL-PRUEBA");
            assertThat(json.get("text").asText()).contains("Cambio de Carrera", "viernes 20 de noviembre de 2026", "10:00–10:20", "Coordinadora de Sistemas");
            assertThat(json.get("html").asText()).contains("Ana &lt;script&gt;").doesNotContain("Ana <script>");
            assertThat(body.get()).doesNotContain("clave-prueba");
        } finally {
            server.stop(0);
        }
    }

    @Test
    void enviaCancelacionConDatosYEscapaElNombre() throws Exception {
        AtomicReference<String> body = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();
        try {
            new CitaConfirmationEmailService("clave-prueba", "CoordinaTec <bienvenida@correo.coordinatec.site>",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/emails").enviarCancelacion(cita);
            JsonNode json = new ObjectMapper().readTree(body.get());
            assertThat(json.get("subject").asText()).contains("Cita cancelada", "FOL-PRUEBA");
            assertThat(json.get("text").asText()).contains("fue cancelada", "Cambio de Carrera", "10:00–10:20", "Coordinadora de Sistemas");
            assertThat(json.get("html").asText()).contains("Ana &lt;script&gt;").doesNotContain("Ana <script>");
        } finally {
            server.stop(0);
        }
    }

    @Test
    void sinClaveOSinCorreoNoIntentaEnviarYUnFalloNoLanzaExcepcion() throws Exception {
        CitaConfirmationEmailService disabled = new CitaConfirmationEmailService("", "Remitente <mail@ejemplo.com>", "http://127.0.0.1:1/emails");
        assertThatCode(() -> disabled.enviarConfirmacion(cita)).doesNotThrowAnyException();
        CitaConfirmationEmailService unavailable = new CitaConfirmationEmailService("clave-prueba", "Remitente <mail@ejemplo.com>", "http://127.0.0.1:1/emails");
        assertThatCode(() -> unavailable.enviarConfirmacion(cita)).doesNotThrowAnyException();
        ConfirmacionCita withoutEmail = new ConfirmacionCita(cita.folio(), cita.nombres(), null,
            cita.tramite(), cita.coordinador(), cita.fecha(), cita.horaInicio(), cita.horaFin());
        assertThatCode(() -> unavailable.enviarConfirmacion(withoutEmail)).doesNotThrowAnyException();
    }
}
