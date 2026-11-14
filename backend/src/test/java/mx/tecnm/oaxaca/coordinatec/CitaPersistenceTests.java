package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CitaPersistenceTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private CitaRepository citas;

    @Autowired
    private CitaConsultaRepository consultaCitas;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtService jwt;

    @Test
    @Transactional
    void migracionCreaEsquemaYCitaSeGuardaConSusRelaciones() throws Exception {
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM flyway_schema_history WHERE version IN ('1', '2', '3', '4') AND success", Integer.class
        )).isEqualTo(4);
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM pg_tables WHERE schemaname = 'public' " +
                "AND tablename IN ('departamento', 'estudiante', 'formato', 'coordinador', " +
                "'horario', 'bloqueo_calendario', 'cita')", Integer.class
        )).isEqualTo(7);

        String sufijo = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String numControl = "TEST" + sufijo;
        String rfc = "TEST" + sufijo;
        String folioFormato = "FMT-" + sufijo;
        String folioCita = "FOL-" + sufijo;

        Integer departamentoId = jdbc.queryForObject(
            "INSERT INTO departamento (nombre_area) VALUES (?) RETURNING id",
            Integer.class, "Departamento de prueba"
        );
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) " +
            "VALUES (?, ?, ?, ?, ?)", numControl, "Ana", "Prueba", "Ingeniería en Sistemas Computacionales", "hash-de-prueba");
        jdbc.update("INSERT INTO tramite (nombre, periodo_dias, duracion_minutos, requisitos, activo, prioridad) " +
            "VALUES (?, ?, ?, ?, ?, ?)", "Tutoría", 2, 35, "Solicitud firmada", true, "MEDIA");
        Long tramiteId = jdbc.queryForObject("SELECT id FROM tramite WHERE nombre = ?", Long.class, "Tutoría");
        jdbc.update("INSERT INTO formato (folio, asunto, tipo_tramite, tramite_id) VALUES (?, ?, ?, ?)",
            folioFormato, "Asesoría", "Tutoría", tramiteId);
        jdbc.update("INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id) " +
            "VALUES (?, ?, ?, ?, ?)", rfc, rfc, "Coordinador de prueba", "hash-de-prueba", departamentoId);
        jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?)", rfc, "Ingeniería en Sistemas Computacionales");
         Integer horarioId = jdbc.queryForObject("INSERT INTO horario (dia_semana, hora_inicio, hora_salida, coordinador_rfc) " +
             "VALUES (?, ?, ?, ?) RETURNING id", Integer.class, 1, LocalTime.of(10, 0), LocalTime.of(11, 0), rfc);
         jdbc.update("INSERT INTO horario_tramite (horario_id, tramite_id) VALUES (?, ?)", horarioId, tramiteId);
         jdbc.update("INSERT INTO carrera_tramite (carrera, tramite_id, habilitado) VALUES (?, ?, TRUE) ON CONFLICT (carrera, tramite_id) DO UPDATE SET habilitado = TRUE",
             "Ingeniería en Sistemas Computacionales", tramiteId);

        LocalDate fechaDisponibilidad = LocalDate.now().with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        mvc.perform(get("/api/v1/coordinadores/{rfc}/horarios", rfc)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].diaSemana").value(1))
            .andExpect(jsonPath("$[0].horaInicio").value("10:00"));
        mvc.perform(get("/api/v1/coordinadores/{rfc}/disponibilidad", rfc)
                .param("fecha", fechaDisponibilidad.toString())
                .param("tramiteId", tramiteId.toString())
                .param("carrera", "Ingeniería en Sistemas Computacionales"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0]").value("10:00"))
            .andExpect(jsonPath("$.length()").value(1));

        CitaEntity cita = new CitaEntity();
        cita.setFolio(folioCita);
        cita.setFecha(LocalDate.of(2026, 10, 29));
        cita.setHoraInicio(LocalTime.of(10, 0));
        cita.setHoraFin(LocalTime.of(10, 35));
        cita.setEstado("PROGRAMADA");
        cita.setMotivo("Asesoría académica");
        cita.setCoordinadorRfc(rfc);
        cita.setNumControlEstudiante(numControl);
        cita.setFormatoFolio(folioFormato);

        citas.saveAndFlush(cita);

        assertThat(citas.findByFolio(folioCita)).hasValueSatisfying(guardada -> {
            assertThat(guardada.getNumControlEstudiante()).isEqualTo(numControl);
            assertThat(guardada.getHoraFin()).isEqualTo(LocalTime.of(10, 35));
            assertThat(guardada.getFormatoFolio()).isEqualTo(folioFormato);
        });
        assertThat(citas.findByNumControlEstudiante(numControl)).extracting(CitaEntity::getFolio)
            .containsExactly(folioCita);
        assertThat(consultaCitas.listar()).anySatisfy(resumen -> {
            assertThat(resumen.folio()).isEqualTo(folioCita);
            assertThat(resumen.numControl()).isEqualTo(numControl);
            assertThat(resumen.nombre()).isEqualTo("Ana Prueba");
            assertThat(resumen.carrera()).isEqualTo("Ingeniería en Sistemas Computacionales");
            assertThat(resumen.tramite()).isEqualTo("Tutoría");
            assertThat(resumen.fecha()).isEqualTo(LocalDate.of(2026, 10, 29));
            assertThat(resumen.horaInicio()).isEqualTo(LocalTime.of(10, 0));
            assertThat(resumen.estado()).isEqualTo("PROGRAMADA");
            assertThat(resumen.fechaAtencion()).isNull();
        });

        mvc.perform(get("/api/v1/citas/estudiantes/{numControl}", numControl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].folio").value(folioCita))
            .andExpect(jsonPath("$[0].numControl").value(numControl))
            .andExpect(jsonPath("$[0].tramite").value("Tutoría"));

        mvc.perform(get("/api/v1/catalogos/citas")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estudiantes[?(@.numControl == '%s')]".formatted(numControl)).isNotEmpty())
            .andExpect(jsonPath("$.coordinadores[?(@.rfc == '%s')]".formatted(rfc)).isNotEmpty())
            .andExpect(jsonPath("$.formatos[?(@.folio == '%s')]".formatted(folioFormato)).isNotEmpty())
            .andExpect(jsonPath("$.formatos[?(@.folio == '%s')].duracionMinutos".formatted(folioFormato)).value(contains(35)));
        mvc.perform(get("/api/v1/catalogos/estudiantes/{numControl}", numControl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numControl").value(numControl))
            .andExpect(jsonPath("$.nombre").value("Ana Prueba"));
        mvc.perform(get("/api/v1/estudiantes/{numControl}", numControl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.numControl").value(numControl))
            .andExpect(jsonPath("$.nombre").value("Ana Prueba"))
            .andExpect(jsonPath("$.carrera").value("Ingeniería en Sistemas Computacionales"));
        mvc.perform(get("/api/v1/catalogos/estudiantes/{numControl}", "NO-EXISTE")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue("NO-EXISTE", "ESTUDIANTE")))
            .andExpect(status().isNotFound());

        LocalDate fechaNuevaCita = fechaDisponibilidad;
        mvc.perform(post("/api/v1/citas")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "fecha": "%s",
                      "horaInicio": "10:00:00",
                      "motivo": "Solicitud desde formulario",
                      "coordinadorRfc": "%s",
                      "numControlEstudiante": "%s",
                      "formatoFolio": "%s"
                    }
                    """.formatted(fechaNuevaCita, rfc, numControl, folioFormato)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.folio").isNotEmpty())
            .andExpect(jsonPath("$.estado").value("PROGRAMADA"))
            .andExpect(jsonPath("$.horaFin").value("10:35:00"))
            .andExpect(jsonPath("$.fechaAtencion").doesNotExist());
        citas.flush();

        mvc.perform(post("/api/v1/citas")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(numControl, "ESTUDIANTE"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "fecha": "%s",
                      "horaInicio": "10:00:00",
                      "motivo": "Solicitud duplicada",
                      "coordinadorRfc": "%s",
                      "numControlEstudiante": "%s",
                      "formatoFolio": "%s"
                    }
                    """.formatted(fechaNuevaCita, rfc, numControl, folioFormato)))
            .andExpect(status().isConflict());

        mvc.perform(get("/api/v1/citas").header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue("jefe@coordina.test", "JEFE_COORDINADORES")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.numControl == '%s' && @.estado == 'PROGRAMADA')]".formatted(numControl)).isNotEmpty());

        mvc.perform(options("/api/v1/citas/{folio}/estado", folioCita)
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PATCH")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type"))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
        mvc.perform(patch("/api/v1/citas/{folio}/estado", folioCita)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR"))
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"RECHAZADA\"}"))
            .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/citas/{folio}/estado", "FOL-INEXISTENTE")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR"))
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ATENDIDA\"}"))
            .andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/citas/{folio}/estado", folioCita)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR"))
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ATENDIDA\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.folio").value(folioCita))
            .andExpect(jsonPath("$.estado").value("ATENDIDA"))
            .andExpect(jsonPath("$.fechaAtencion").isNotEmpty());

        assertThat(jdbc.queryForObject("SELECT estado FROM cita WHERE folio = ?", String.class, folioCita))
            .isEqualTo("ATENDIDA");
        assertThat(jdbc.queryForObject("SELECT fecha_atencion FROM cita WHERE folio = ?", java.time.OffsetDateTime.class, folioCita))
            .isNotNull();
        assertThat(consultaCitas.listar())
            .filteredOn(resumen -> resumen.folio().equals(folioCita))
            .singleElement()
            .satisfies(resumen -> assertThat(resumen.fechaAtencion()).isNotNull());
        mvc.perform(get("/api/v1/citas/{folio}", folioCita)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.estado").value("ATENDIDA"))
            .andExpect(jsonPath("$.fechaAtencion").isNotEmpty());
        mvc.perform(patch("/api/v1/citas/{folio}/estado", folioCita)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt.issue(rfc, "COORDINADOR"))
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ATENDIDA\"}"))
            .andExpect(status().isConflict());
    }
}
