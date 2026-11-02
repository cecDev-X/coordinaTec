package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.dtos.CoordinadorOpcionDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteOpcionDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.FormatoOpcionDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CatalogoConsultaRepository {

    private final JdbcTemplate jdbc;

    public CatalogoConsultaRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<EstudianteOpcionDTO> listarEstudiantes() {
        return jdbc.query("""
            SELECT numerocontrol, nombres, apellidos, carrera
            FROM estudiante
            ORDER BY apellidos, nombres, numerocontrol
            """, (rs, row) -> new EstudianteOpcionDTO(
                rs.getString("numerocontrol"),
                rs.getString("nombres") + " " + rs.getString("apellidos"),
                rs.getString("carrera")
            ));
    }

    public List<CoordinadorOpcionDTO> listarCoordinadores() {
        return jdbc.query("""
            SELECT c.rfc, c.nombre_completo, d.nombre_area
            FROM coordinador c
            JOIN departamento d ON d.id = c.departamento_id
            ORDER BY c.nombre_completo, c.rfc
            """, (rs, row) -> new CoordinadorOpcionDTO(
                rs.getString("rfc"),
                rs.getString("nombre_completo"),
                rs.getString("nombre_area")
            ));
    }

    public List<FormatoOpcionDTO> listarFormatos() {
        return jdbc.query("""
            SELECT f.folio, f.asunto, t.nombre AS tipo_tramite, t.duracion_minutos
            FROM formato f
            JOIN tramite t ON t.id = f.tramite_id
            ORDER BY f.fecha DESC, f.folio
            """, (rs, row) -> new FormatoOpcionDTO(
                rs.getString("folio"),
                rs.getString("asunto"),
                rs.getString("tipo_tramite"),
                rs.getInt("duracion_minutos")
            ));
    }

    public int obtenerDuracionFormato(String folio) {
        return jdbc.queryForObject("""
            SELECT t.duracion_minutos
            FROM formato f
            JOIN tramite t ON t.id = f.tramite_id
            WHERE f.folio = ?
            """, Integer.class, folio);
    }

    public boolean existeEstudiante(String numControl) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM estudiante WHERE numerocontrol = ?)",
            Boolean.class, numControl
        ));
    }

    public boolean existeCoordinador(String rfc) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM coordinador WHERE rfc = ?)",
            Boolean.class, rfc
        ));
    }

    public boolean existeFormato(String folio) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM formato WHERE folio = ?)",
            Boolean.class, folio
        ));
    }
}
