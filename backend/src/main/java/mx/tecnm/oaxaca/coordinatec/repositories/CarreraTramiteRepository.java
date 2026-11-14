package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class CarreraTramiteRepository {
    private final JdbcTemplate jdbc;

    public CarreraTramiteRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<String> listarCarreras(String username, boolean jefatura) {
        String sql = jefatura
            ? "SELECT nombre FROM carrera ORDER BY nombre"
            : "SELECT cc.carrera FROM coordinador_carrera cc JOIN coordinador c ON c.rfc = cc.coordinador_rfc WHERE lower(c.username) = lower(?) ORDER BY cc.carrera";
        return jefatura ? jdbc.queryForList(sql, String.class) : jdbc.queryForList(sql, String.class, username);
    }

    public boolean puedeAdministrar(String username, boolean jefatura, String carrera) {
        if (jefatura) {
            return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera));
        }
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (
                SELECT 1 FROM coordinador_carrera cc
                JOIN coordinador c ON c.rfc = cc.coordinador_rfc
                WHERE lower(c.username) = lower(?) AND cc.carrera = ?
            )
            """, Boolean.class, username, carrera));
    }

    public List<Map<String, Object>> listarTramites(String carrera) {
        return jdbc.query("""
            SELECT t.id, t.nombre, t.activo AS activo_catalogo,
                   COALESCE(ct.habilitado, FALSE) AS habilitado
            FROM tramite t
            LEFT JOIN carrera_tramite ct ON ct.tramite_id = t.id AND ct.carrera = ?
            ORDER BY t.nombre
            """, (rs, row) -> Map.of(
                "id", rs.getLong("id"),
                "nombre", rs.getString("nombre"),
                "activo", rs.getBoolean("activo_catalogo"),
                "habilitado", rs.getBoolean("activo_catalogo") && rs.getBoolean("habilitado")
            ), carrera);
    }

    public boolean actualizar(String carrera, long tramiteId, boolean habilitado) {
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera))
            || !Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM tramite WHERE id = ? AND activo = TRUE)", Boolean.class, tramiteId))) {
            return false;
        }
        jdbc.update("""
            INSERT INTO carrera_tramite (carrera, tramite_id, habilitado) VALUES (?, ?, ?)
            ON CONFLICT (carrera, tramite_id) DO UPDATE SET habilitado = EXCLUDED.habilitado
            """, carrera, tramiteId, habilitado);
        return true;
    }

    public List<Long> listarIdsHabilitados(String carrera) {
        return jdbc.queryForList("""
            SELECT ct.tramite_id
            FROM carrera_tramite ct JOIN tramite t ON t.id = ct.tramite_id
            WHERE ct.carrera = ? AND ct.habilitado = TRUE AND t.activo = TRUE
            ORDER BY ct.tramite_id
            """, Long.class, carrera);
    }

    public List<Long> listarIdsGlobalesActivos() {
        return jdbc.queryForList("SELECT id FROM tramite WHERE activo = TRUE ORDER BY id", Long.class);
    }

    public String obtenerCarreraEstudiante(String numeroControl) {
        return jdbc.queryForObject("SELECT carrera FROM estudiante WHERE numerocontrol = ?", String.class, numeroControl);
    }

    public boolean estaHabilitado(String carrera, long tramiteId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (
                SELECT 1 FROM carrera_tramite ct JOIN tramite t ON t.id = ct.tramite_id
                WHERE ct.carrera = ? AND ct.tramite_id = ? AND ct.habilitado = TRUE AND t.activo = TRUE
            )
            """, Boolean.class, carrera, tramiteId));
    }

    public boolean estudiantePuedeConsultarHorario(String numeroControl, String rfc) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (
                SELECT 1 FROM estudiante e
                JOIN coordinador_carrera cc ON cc.carrera = e.carrera
                WHERE e.numerocontrol = ? AND cc.coordinador_rfc = ?
            )
            """, Boolean.class, numeroControl, rfc));
    }
}
