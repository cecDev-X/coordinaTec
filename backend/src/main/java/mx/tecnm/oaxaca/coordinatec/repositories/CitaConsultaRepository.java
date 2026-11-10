package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.dtos.CitaResumenDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CitaConsultaRepository {

    private final JdbcTemplate jdbc;

    public CitaConsultaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<CitaResumenDTO> listar() {
        return query("""
            SELECT c.folio, e.numerocontrol, e.nombres, e.apellidos, e.carrera,
                   t.nombre AS tipo_tramite, c.fecha_programada, c.hora_inicio, c.estado, c.fecha_atencion
            FROM cita c
            JOIN estudiante e ON e.numerocontrol = c.estudiante_numerocontrol
            JOIN formato f ON f.folio = c.formato_folio
            JOIN tramite t ON t.id = f.tramite_id
            ORDER BY c.fecha_programada DESC, c.hora_inicio DESC, c.folio
            """);
    }

    public List<CitaResumenDTO> listarPorEstudiante(String numControl) {
        return query("""
            SELECT c.folio, e.numerocontrol, e.nombres, e.apellidos, e.carrera,
                   t.nombre AS tipo_tramite, c.fecha_programada, c.hora_inicio, c.estado, c.fecha_atencion
            FROM cita c
            JOIN estudiante e ON e.numerocontrol = c.estudiante_numerocontrol
            JOIN formato f ON f.folio = c.formato_folio
            JOIN tramite t ON t.id = f.tramite_id
            WHERE c.estudiante_numerocontrol = ?
            ORDER BY c.fecha_programada DESC, c.hora_inicio DESC, c.folio
            """, numControl);
    }

    public List<CitaResumenDTO> listarPorCarrerasCoordinador(String rfc) {
        return query("""
            SELECT c.folio, e.numerocontrol, e.nombres, e.apellidos, e.carrera,
                   t.nombre AS tipo_tramite, c.fecha_programada, c.hora_inicio, c.estado, c.fecha_atencion
            FROM cita c
            JOIN estudiante e ON e.numerocontrol = c.estudiante_numerocontrol
            JOIN formato f ON f.folio = c.formato_folio
            JOIN tramite t ON t.id = f.tramite_id
            WHERE EXISTS (
                SELECT 1 FROM coordinador_carrera cc
                WHERE cc.coordinador_rfc = ? AND cc.carrera = e.carrera
            )
            ORDER BY c.fecha_programada DESC, c.hora_inicio DESC, c.folio
            """, rfc);
    }

    public boolean coordinadorTieneCitaDeCarreraAsignada(String rfc, String folio) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (
                SELECT 1 FROM cita c
                JOIN estudiante e ON e.numerocontrol = c.estudiante_numerocontrol
                JOIN coordinador_carrera cc ON cc.carrera = e.carrera
                WHERE c.folio = ? AND cc.coordinador_rfc = ?
            )
            """, Boolean.class, folio, rfc));
    }

    public boolean coordinadorAtiendeEstudiante(String rfc, String numControl) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (SELECT 1 FROM coordinador_carrera cc
                JOIN estudiante e ON e.carrera = cc.carrera
                WHERE cc.coordinador_rfc = ? AND e.numerocontrol = ?)
            """, Boolean.class, rfc, numControl));
    }

    public boolean estudianteTieneCita(String numControl, String folio) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM cita WHERE estudiante_numerocontrol = ? AND folio = ?)",
            Boolean.class, numControl, folio));
    }

    private List<CitaResumenDTO> query(String sql, Object... params) {
        return jdbc.query(sql, (rs, row) -> new CitaResumenDTO(
                rs.getString("folio"),
                rs.getString("numerocontrol"),
                rs.getString("nombres") + " " + rs.getString("apellidos"),
                rs.getString("carrera"),
                rs.getString("tipo_tramite"),
                rs.getObject("fecha_programada", java.time.LocalDate.class),
                rs.getObject("hora_inicio", java.time.LocalTime.class),
                rs.getString("estado"),
                rs.getObject("fecha_atencion", java.time.OffsetDateTime.class) == null
                    ? null
                    : rs.getObject("fecha_atencion", java.time.OffsetDateTime.class).toInstant()
            ), params);
    }
}
