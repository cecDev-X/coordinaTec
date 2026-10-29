package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CitaPersistenceTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private CitaRepository citas;

    @Test
    @Transactional
    void migracionCreaEsquemaYCitaSeGuardaConSusRelaciones() {
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM flyway_schema_history WHERE version = '1' AND success", Integer.class
        )).isEqualTo(1);
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
            "VALUES (?, ?, ?, ?, ?)", numControl, "Ana", "Prueba", "Sistemas", "hash-de-prueba");
        jdbc.update("INSERT INTO formato (folio, asunto, tipo_tramite) VALUES (?, ?, ?)",
            folioFormato, "Asesoría", "Tutoría");
        jdbc.update("INSERT INTO coordinador (rfc, nombre_completo, password_hash, departamento_id) " +
            "VALUES (?, ?, ?, ?)", rfc, "Coordinador de prueba", "hash-de-prueba", departamentoId);

        CitaEntity cita = new CitaEntity();
        cita.setFolio(folioCita);
        cita.setFecha(LocalDate.of(2026, 10, 29));
        cita.setHoraInicio(LocalTime.of(10, 0));
        cita.setHoraFin(LocalTime.of(10, 20));
        cita.setEstado("PROGRAMADA");
        cita.setMotivo("Asesoría académica");
        cita.setCoordinadorRfc(rfc);
        cita.setNumControlEstudiante(numControl);
        cita.setFormatoFolio(folioFormato);

        citas.saveAndFlush(cita);

        assertThat(citas.findByFolio(folioCita)).hasValueSatisfying(guardada -> {
            assertThat(guardada.getNumControlEstudiante()).isEqualTo(numControl);
            assertThat(guardada.getHoraFin()).isEqualTo(LocalTime.of(10, 20));
            assertThat(guardada.getFormatoFolio()).isEqualTo(folioFormato);
        });
        assertThat(citas.findByNumControlEstudiante(numControl)).extracting(CitaEntity::getFolio)
            .containsExactly(folioCita);
    }
}
