package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import mx.tecnm.oaxaca.coordinatec.notifications.CitaConfirmationEmailService;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository.ConfirmacionCita;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CitaConfirmationFlowTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtService jwt;
    @MockitoBean CitaConfirmationEmailService mail;

    @Test
    void avisaSoloDespuesDeRegistrarLaCitaExitosamente() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String control = "C" + unique;
        String rfc = "R" + unique;
        String formato = "FMT-" + unique;
        String carrera = "Ingeniería en Sistemas Computacionales";
        LocalDate fecha = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        Integer departamento = jdbc.queryForObject("INSERT INTO departamento (nombre_area) VALUES (?) RETURNING id", Integer.class, "Depto " + unique);
        Long tramite = null;
        try {
            jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, correo, password_hash) VALUES (?, 'Ana', 'Prueba', ?, ?, '!')",
                control, carrera, "cita-" + unique + "@ejemplo.com");
            tramite = jdbc.queryForObject("""
                INSERT INTO tramite (nombre, periodo_dias, duracion_minutos, requisitos, activo, prioridad)
                VALUES (?, 1, 20, '', TRUE, 'MEDIA') RETURNING id
                """, Long.class, "Tutoría " + unique);
            jdbc.update("INSERT INTO carrera_tramite (carrera, tramite_id, habilitado) VALUES (?, ?, TRUE)", carrera, tramite);
            jdbc.update("INSERT INTO formato (folio, asunto, tipo_tramite, tramite_id) VALUES (?, 'Cita', 'Tutoría', ?)", formato, tramite);
            jdbc.update("INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id) VALUES (?, ?, 'Coordinador de prueba', '!', ?)", rfc, rfc, departamento);
            jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?)", rfc, carrera);
            Integer horario = jdbc.queryForObject("INSERT INTO horario (dia_semana, hora_inicio, hora_salida, coordinador_rfc) VALUES (1, '10:00', '11:00', ?) RETURNING id", Integer.class, rfc);
            jdbc.update("INSERT INTO horario_tramite (horario_id, tramite_id) VALUES (?, ?)", horario, tramite);

            String payload = """
                {"fecha":"%s","horaInicio":"10:00","coordinadorRfc":"%s",
                 "numControlEstudiante":"%s","formatoFolio":"%s"}
                """.formatted(fecha, rfc, control, formato);
            String authorization = "Bearer " + jwt.issue(control, "ESTUDIANTE");
            mvc.perform(post("/api/v1/citas").header("Authorization", authorization)
                    .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated());
            org.mockito.ArgumentCaptor<ConfirmacionCita> captor = org.mockito.ArgumentCaptor.forClass(ConfirmacionCita.class);
            verify(mail).enviarConfirmacion(captor.capture());
            ConfirmacionCita sent = captor.getValue();
            assertThat(sent.folio()).startsWith("FOL-");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM cita WHERE folio = ?", Integer.class, sent.folio())).isEqualTo(1);
            assertThat(sent.tramite()).isEqualTo("Tutoría " + unique);
            assertThat(sent.coordinador()).isEqualTo("Coordinador de prueba");
            assertThat(sent.fecha()).isEqualTo(fecha);
            assertThat(sent.horaInicio().toString()).isEqualTo("10:00");
            assertThat(sent.correo()).isEqualTo("cita-" + unique + "@ejemplo.com");

            mvc.perform(post("/api/v1/citas").header("Authorization", authorization)
                    .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isConflict());
            verify(mail, times(1)).enviarConfirmacion(any(ConfirmacionCita.class));

            doThrow(new IllegalStateException("Cola de correo no disponible"))
                .when(mail).enviarConfirmacion(any(ConfirmacionCita.class));
            mvc.perform(post("/api/v1/citas").header("Authorization", authorization)
                    .contentType(MediaType.APPLICATION_JSON).content(payload.replace("10:00", "10:20")))
                .andExpect(status().isCreated());
            assertThat(jdbc.queryForObject("SELECT count(*) FROM cita WHERE estudiante_numerocontrol = ?", Integer.class, control))
                .isEqualTo(2);
        } finally {
            jdbc.update("DELETE FROM cita WHERE estudiante_numerocontrol = ?", control);
            jdbc.update("DELETE FROM horario WHERE coordinador_rfc = ?", rfc);
            jdbc.update("DELETE FROM coordinador_carrera WHERE coordinador_rfc = ?", rfc);
            jdbc.update("DELETE FROM coordinador WHERE rfc = ?", rfc);
            jdbc.update("DELETE FROM formato WHERE folio = ?", formato);
            if (tramite != null) {
                jdbc.update("DELETE FROM carrera_tramite WHERE tramite_id = ?", tramite);
                jdbc.update("DELETE FROM tramite WHERE id = ?", tramite);
            }
            jdbc.update("DELETE FROM estudiante WHERE numerocontrol = ?", control);
            jdbc.update("DELETE FROM departamento WHERE id = ?", departamento);
        }
    }
}
