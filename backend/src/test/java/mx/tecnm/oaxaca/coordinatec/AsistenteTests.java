package mx.tecnm.oaxaca.coordinatec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import mx.tecnm.oaxaca.coordinatec.controllers.AsistenteController.Consulta;
import mx.tecnm.oaxaca.coordinatec.services.AsistenteService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AsistenteTests {
    @Test
    void soloEnviaCatalogoYPreguntaSinIdentidadYLimitaSolicitudes() throws Exception {
        AtomicReference<String> body = new AtomicReference<>();
        AtomicReference<String> authorization = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/chat", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] answer = "{\"choices\":[{\"message\":{\"content\":\"Elige un trámite en Inicio.\"}}]}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, answer.length);
            exchange.getResponseBody().write(answer);
            exchange.close();
        });
        server.start();
        try {
            JdbcTemplate jdbc = mock(JdbcTemplate.class);
            when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), eq("23160887")))
                .thenReturn(List.of("Ingeniería en Sistemas Computacionales"));
            when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), eq("Ingeniería en Sistemas Computacionales")))
                .thenReturn(List.of("- Baja de materia: Formato firmado"));
            AsistenteService service = new AsistenteService(jdbc, "clave-secreta", "openai/gpt-oss-20b",
                "http://127.0.0.1:" + server.getAddress().getPort() + "/chat");
            Consulta consulta = new Consulta("¿Cómo agendo?", List.of());
            ResponseEntity<?> result = service.consultar("23160887", consulta);
            assertThat(result.getStatusCode().value()).isEqualTo(200);
            assertThat(result.getBody().toString()).contains("Elige un trámite en Inicio.");
            JsonNode payload = new ObjectMapper().readTree(body.get());
            assertThat(authorization.get()).isEqualTo("Bearer clave-secreta");
            assertThat(payload.path("messages").get(0).path("content").asText())
                .contains("Baja de materia", "Formato firmado");
            assertThat(body.get()).doesNotContain("23160887", "clave-secreta", "password_hash");
            for (int i = 0; i < 9; i++) assertThat(service.consultar("23160887", consulta).getStatusCode().value()).isEqualTo(200);
            assertThat(service.consultar("23160887", consulta).getStatusCode().value()).isEqualTo(429);
        } finally {
            server.stop(0);
        }
    }

    @Test
    void sinClaveNoConsultaProveedor() {
        AsistenteService service = new AsistenteService(mock(JdbcTemplate.class), "", "openai/gpt-oss-20b", "http://127.0.0.1:1/chat");
        assertThat(service.consultar("alumno", new Consulta("Hola", List.of())).getStatusCode().value()).isEqualTo(503);
    }
}
