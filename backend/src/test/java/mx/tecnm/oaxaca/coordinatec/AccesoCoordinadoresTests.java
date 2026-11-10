package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AccesoCoordinadoresTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired JwtService jwt;

    @Test
    @Transactional
    void jefaturaCreaCoordinadorConCarrerasYLosRolesRestringenElAcceso() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String jefe = "jefe-" + unique;
        String rfc = "C" + unique;
        String otraCarrera = "Ingeniería Química";
        String carrera = "Ingeniería en Sistemas Computacionales";
        String ajena = "Ingeniería Civil";
        jdbc.update("INSERT INTO jefe_coordinadores (username, nombre_completo, password_hash) VALUES (?, ?, ?)", jefe, "Jefa de prueba", passwords.encode("ClaveJefatura123!"));
        jdbc.update("INSERT INTO departamento (nombre_area) VALUES (?)", "Departamento " + unique);
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, 'Ana', 'Prueba', ?, ?)", "S" + unique, carrera, passwords.encode("ClaveEstudiante123!"));
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, 'Luis', 'Prueba', ?, ?)", "I" + unique, otraCarrera, passwords.encode("ClaveEstudiante123!"));
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, 'Mar', 'Prueba', ?, ?)", "M" + unique, ajena, passwords.encode("ClaveEstudiante123!"));

        mvc.perform(get("/api/v1/jefe-coordinadores")).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/jefe-coordinadores/carreras").header("Authorization", "Bearer " + jwt.issue(jefe, "JEFE_COORDINADORES")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@ == 'Ingeniería Química')]").isNotEmpty())
            .andExpect(jsonPath("$[?(@ == 'Ingeniería Civil')]").isNotEmpty())
            .andExpect(jsonPath("$[?(@ == 'Ingeniería Mecatrónica')]").isNotEmpty());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + jefe + "\",\"password\":\"incorrecta\"}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + jefe + "\",\"password\":\"ClaveJefatura123!\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("JEFE_COORDINADORES"))
            .andExpect(jsonPath("$.token").isNotEmpty());

        String crear = """
            {"rfc":"%s","nombreCompleto":"Coordinadora de prueba","password":"ClaveCoordinadora123!","carreras":["%s","%s","Ingeniería Mecatrónica"]}
            """.formatted(rfc, carrera, otraCarrera);
        mvc.perform(post("/api/v1/jefe-coordinadores").contentType(MediaType.APPLICATION_JSON).content(crear))
            .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/jefe-coordinadores").header("Authorization", "Bearer " + jwt.issue(jefe, "JEFE_COORDINADORES"))
                .contentType(MediaType.APPLICATION_JSON).content(crear))
            .andExpect(status().isCreated());
        mvc.perform(post("/api/v1/jefe-coordinadores").header("Authorization", "Bearer " + jwt.issue(jefe, "JEFE_COORDINADORES"))
                .contentType(MediaType.APPLICATION_JSON).content(crear))
            .andExpect(status().isConflict());
        assertThat(passwords.matches("ClaveCoordinadora123!", jdbc.queryForObject("SELECT password_hash FROM coordinador WHERE rfc = ?", String.class, rfc))).isTrue();
        assertThat(jdbc.queryForList("SELECT carrera FROM coordinador_carrera WHERE coordinador_rfc = ? ORDER BY carrera", String.class, rfc))
            .containsExactlyInAnyOrder(otraCarrera, carrera, "Ingeniería Mecatrónica");

        Integer tramite = jdbc.queryForObject("INSERT INTO tramite (nombre, periodo_dias, duracion_minutos, requisitos, activo, prioridad) VALUES (?, 1, 20, 'Solicitud', true, 'MEDIA') RETURNING id",
            Integer.class, "Tutoría " + unique);
        String formato = "FMT-" + unique;
        jdbc.update("INSERT INTO formato (folio, asunto, tipo_tramite, tramite_id) VALUES (?, 'Prueba', 'Tutoría', ?)", formato, tramite);
        jdbc.update("INSERT INTO cita (folio, fecha_programada, hora_inicio, hora_fin, estado, coordinador_rfc, estudiante_numerocontrol, formato_folio) VALUES (?, '2030-11-05', '10:00', '10:20', 'PROGRAMADA', ?, ?, ?)",
            "SI-" + unique, rfc, "S" + unique, formato);
        jdbc.update("INSERT INTO cita (folio, fecha_programada, hora_inicio, hora_fin, estado, coordinador_rfc, estudiante_numerocontrol, formato_folio) VALUES (?, '2030-11-05', '10:20', '10:40', 'PROGRAMADA', ?, ?, ?)",
            "IN-" + unique, rfc, "I" + unique, formato);
        jdbc.update("INSERT INTO cita (folio, fecha_programada, hora_inicio, hora_fin, estado, coordinador_rfc, estudiante_numerocontrol, formato_folio) VALUES (?, '2030-11-05', '10:40', '11:00', 'PROGRAMADA', ?, ?, ?)",
            "ME-" + unique, rfc, "M" + unique, formato);

        mvc.perform(get("/api/v1/citas/coordinador/{rfc}", rfc)
                .header("Authorization", "Bearer " + jwt.issue(jefe, "JEFE_COORDINADORES")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.folio == 'SI-%s')]".formatted(unique)).isNotEmpty());

        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + rfc + "\",\"password\":\"ClaveCoordinadora123!\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("COORDINADOR"));
        String token = "Bearer " + jwt.issue(rfc, "COORDINADOR");
        mvc.perform(get("/api/v1/jefe-coordinadores").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas/coordinador/{rfc}", rfc).header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.folio == 'SI-%s')]".formatted(unique)).isNotEmpty())
            .andExpect(jsonPath("$[?(@.folio == 'IN-%s')]".formatted(unique)).isNotEmpty())
            .andExpect(jsonPath("$[?(@.folio == 'ME-%s')]".formatted(unique)).isEmpty());
        mvc.perform(get("/api/v1/citas/{folio}", "ME-" + unique).header("Authorization", token))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas/{folio}", "SI-" + unique).header("Authorization", token))
            .andExpect(status().isOk());
        mvc.perform(get("/api/v1/citas/coordinador/{rfc}", "OTRO").header("Authorization", token)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas/coordinador/{rfc}", rfc).header("Authorization", "Bearer " + jwt.issue("S" + unique, "ESTUDIANTE")))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas/estudiantes/{numControl}", "M" + unique)
                .header("Authorization", "Bearer " + jwt.issue("S" + unique, "ESTUDIANTE")))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/citas/estudiantes/{numControl}", "S" + unique)
                .header("Authorization", "Bearer " + jwt.issue("S" + unique, "ESTUDIANTE")))
            .andExpect(status().isOk());
    }
}
