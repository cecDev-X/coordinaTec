package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HorarioSinFormatoTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;

    @Test
    @Transactional
    void guardarBloqueGeneraFormatoYPermiteConsultarHoras() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String rfc = "C" + unique;
        String carrera = "Ingeniería en Sistemas Computacionales";
        String estudiante = "S" + unique;
        Integer departamento = jdbc.queryForObject(
            "INSERT INTO departamento (nombre_area) VALUES (?) RETURNING id", Integer.class, "Departamento " + unique);
        jdbc.update("INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id) VALUES (?, ?, 'Coordinador', '!', ?)",
            rfc, rfc, departamento);
        jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?)", rfc, carrera);
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, 'Ana', 'Prueba', ?, '!')", estudiante, carrera);
        Long tramite = jdbc.queryForObject("""
            INSERT INTO tramite (nombre, periodo_dias, duracion_minutos, requisitos, activo, prioridad)
            VALUES (?, 1, 20, '', true, 'MEDIA') RETURNING id
            """, Long.class, "Cambio de Carrera " + unique);
        jdbc.update("INSERT INTO carrera_tramite (carrera, tramite_id, habilitado) VALUES (?, ?, true)", carrera, tramite);

        String token = "Bearer " + jwt.issue(rfc, "COORDINADOR");
        mvc.perform(put("/api/v1/coordinadores/{rfc}/horarios", rfc).header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("[{\"diaSemana\":2,\"horaInicio\":\"09:00\",\"horaSalida\":\"10:00\",\"tramiteIds\":[" + tramite + "]}]"))
            .andExpect(status().isOk());

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM formato WHERE tramite_id = ?", Integer.class, tramite)).isEqualTo(1);
        mvc.perform(get("/api/v1/catalogos/citas").header("Authorization", "Bearer " + jwt.issue(estudiante, "ESTUDIANTE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.formatos[?(@.folio == 'AUTO-TRAMITE-%d')]".formatted(tramite)).isNotEmpty());
        LocalDate martes = LocalDate.now().plusDays(1).with(TemporalAdjusters.next(DayOfWeek.TUESDAY));
        mvc.perform(get("/api/v1/coordinadores/{rfc}/disponibilidad", rfc)
                .param("fecha", martes.toString()).param("tramiteId", tramite.toString()).param("carrera", carrera))
            .andExpect(status().isOk()).andExpect(jsonPath("$[0]").value("09:00"));
        mvc.perform(post("/api/v1/citas").header("Authorization", "Bearer " + jwt.issue(estudiante, "ESTUDIANTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"fecha":"%s","horaInicio":"09:00","motivo":"Cambio de Carrera",
                     "coordinadorRfc":"%s","numControlEstudiante":"%s","formatoFolio":"AUTO-TRAMITE-%d"}
                    """.formatted(martes, rfc, estudiante, tramite)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.formatoFolio").value("AUTO-TRAMITE-" + tramite));
    }
}
