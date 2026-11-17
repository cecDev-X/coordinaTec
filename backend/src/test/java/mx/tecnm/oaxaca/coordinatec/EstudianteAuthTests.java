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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
        String numControl = "C" + String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100000000));
        String correo = "estudiante-" + UUID.randomUUID() + "@ejemplo.com";
        mvc.perform(get("/api/v1/estudiantes/carreras"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@ == 'Ingeniería Civil')]").isNotEmpty())
            .andExpect(jsonPath("$[?(@ == 'Ingeniería Mecatrónica')]").isNotEmpty());
        String registro = """
            {
              "numControl": "%s",
              "nombres": "Ana María",
              "apellidos": "Muñoz López",
              "carrera": "Ingeniería en Sistemas Computacionales",
              "correo": "%s",
              "password": "ClaveSegura123!"
            }
            """.formatted(numControl, correo);

        mvc.perform(post("/api/v1/estudiantes/registro")
                .contentType(MediaType.APPLICATION_JSON).content(registro))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.numControl").value(numControl))
            .andExpect(jsonPath("$.nombre").value("Ana María Muñoz López"))
            .andExpect(jsonPath("$.correo").value(correo))
            .andExpect(jsonPath("$.rol").value("ESTUDIANTE"))
            .andExpect(jsonPath("$.token").isNotEmpty());

        String storedHash = jdbc.queryForObject(
            "SELECT password_hash FROM estudiante WHERE numerocontrol = ?", String.class, numControl
        );
        assertThat(storedHash).isNotEqualTo("ClaveSegura123!");
        assertThat(passwordEncoder.matches("ClaveSegura123!", storedHash)).isTrue();
        assertThat(jdbc.queryForObject("SELECT correo FROM estudiante WHERE numerocontrol = ?", String.class, numControl)).isEqualTo(correo);

        String sesion = """
            {"numControl":"%s", "password":"ClaveSegura123!"}
            """.formatted(numControl);
        mvc.perform(post("/api/v1/estudiantes/sesion")
                .contentType(MediaType.APPLICATION_JSON).content(sesion))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numControl").value(numControl))
            .andExpect(jsonPath("$.correo").value(correo))
            .andExpect(jsonPath("$.token").isNotEmpty());

        mvc.perform(post("/api/v1/estudiantes/sesion")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"numControl\":\"%s\", \"password\":\"incorrecta\"}".formatted(numControl)))
            .andExpect(status().isUnauthorized());

        mvc.perform(post("/api/v1/estudiantes/registro")
                .contentType(MediaType.APPLICATION_JSON).content(registro))
            .andExpect(status().isConflict());

        mvc.perform(post("/api/v1/estudiantes/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registro.replace("Ingeniería en Sistemas Computacionales", "Carrera no registrada")))
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void registroAceptaOchoDigitosSinPrefijo() throws Exception {
        String numControl = String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100000000));
        mvc.perform(post("/api/v1/estudiantes/registro").contentType(MediaType.APPLICATION_JSON).content("""
            {"numControl":"%s","nombres":"José","apellidos":"De la Cruz",
             "carrera":"Ingeniería en Sistemas Computacionales","correo":"alumno@ejemplo.com",
             "password":"Segura123!"}
            """.formatted(numControl)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.numControl").value(numControl));
    }

    @Test
    void registroRechazaDatosInvalidos() throws Exception {
        String valido = """
            {"numControl":"23160887","nombres":"José","apellidos":"De la Cruz",
             "carrera":"Ingeniería en Sistemas Computacionales","correo":"alumno@ejemplo.com",
             "password":"Segura123!"}
            """;
        for (String invalido : new String[] {
            valido.replace("23160887", "2316088"),
            valido.replace("23160887", "C2316088"),
            valido.replace("José", "José1"),
            valido.replace("De la Cruz", "Cruz2"),
            valido.replace("alumno@ejemplo.com", "correo-invalido"),
            valido.replace("\"correo\":\"alumno@ejemplo.com\",", ""),
            valido.replace("Segura123!", "segura123!"),
            valido.replace("Segura123!", "Segura123"),
            valido.replace("Segura123!", "Seguraabc!"),
            valido.replace("Segura123!", "SE GURA123!")
        }) {
            mvc.perform(post("/api/v1/estudiantes/registro").contentType(MediaType.APPLICATION_JSON).content(invalido))
                .andExpect(status().isBadRequest());
        }
    }
}
