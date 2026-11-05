package mx.tecnm.oaxaca.coordinatec;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EstudianteAuthTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    void registroGuardaPasswordCifradaYPermiteIniciarSesion() throws Exception {
        String numControl = "AUTH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String registro = """
            {
              "numControl": "%s",
              "nombres": "Ana",
              "apellidos": "Prueba",
              "carrera": "Sistemas",
              "password": "ClaveSegura123"
            }
            """.formatted(numControl);

        mvc.perform(post("/api/v1/estudiantes/registro")
                .contentType(MediaType.APPLICATION_JSON).content(registro))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.numControl").value(numControl))
            .andExpect(jsonPath("$.nombre").value("Ana Prueba"))
            .andExpect(jsonPath("$.rol").value("ESTUDIANTE"));

        String storedHash = jdbc.queryForObject(
            "SELECT password_hash FROM estudiante WHERE numerocontrol = ?", String.class, numControl
        );
        assertThat(storedHash).isNotEqualTo("ClaveSegura123");
        assertThat(passwordEncoder.matches("ClaveSegura123", storedHash)).isTrue();

        String sesion = """
            {"numControl":"%s", "password":"ClaveSegura123"}
            """.formatted(numControl);
        mvc.perform(post("/api/v1/estudiantes/sesion")
                .contentType(MediaType.APPLICATION_JSON).content(sesion))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numControl").value(numControl));

        mvc.perform(post("/api/v1/estudiantes/sesion")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numControl\":\"%s\", \"password\":\"incorrecta\"}".formatted(numControl)))
            .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/v1/estudiantes/registro")
                .contentType(MediaType.APPLICATION_JSON).content(registro))
            .andExpect(status().isConflict());
    }
}
