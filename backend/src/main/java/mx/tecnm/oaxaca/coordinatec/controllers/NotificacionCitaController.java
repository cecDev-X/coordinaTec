package mx.tecnm.oaxaca.coordinatec.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notificaciones/citas")
public class NotificacionCitaController {
    private final JdbcTemplate jdbc;

    public NotificacionCitaController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public Map<String, Object> listar(Authentication authentication) {
        String rol = rol(authentication);
        String usuario = authentication.getName();
        int pendientes = jdbc.queryForObject("""
            SELECT count(*) FROM notificacion_cita
            WHERE rol = ? AND destinatario = ? AND leida_en IS NULL
            """, Integer.class, rol, usuario);
        List<Notificacion> notificaciones = jdbc.query("""
            SELECT n.id, n.folio, n.creada_en, n.leida_en, c.fecha_programada, c.hora_inicio,
                   e.nombres || ' ' || e.apellidos AS estudiante, t.nombre AS tramite
            FROM notificacion_cita n
            JOIN cita c ON c.folio = n.folio
            JOIN estudiante e ON e.numerocontrol = c.estudiante_numerocontrol
            JOIN formato f ON f.folio = c.formato_folio
            JOIN tramite t ON t.id = f.tramite_id
            WHERE n.rol = ? AND n.destinatario = ?
            ORDER BY n.creada_en DESC, n.id DESC LIMIT 20
            """, (rs, row) -> new Notificacion(
                rs.getLong("id"), rs.getString("folio"), rs.getString("estudiante"), rs.getString("tramite"),
                rs.getObject("fecha_programada", LocalDate.class), rs.getObject("hora_inicio", LocalTime.class),
                rs.getObject("creada_en", LocalDateTime.class), rs.getObject("leida_en", LocalDateTime.class) != null
            ), rol, usuario);
        return Map.of("pendientes", pendientes, "notificaciones", notificaciones);
    }

    @PatchMapping("/{id}/leer")
    public ResponseEntity<Void> leer(@PathVariable long id, Authentication authentication) {
        int updated = jdbc.update("""
            UPDATE notificacion_cita SET leida_en = CURRENT_TIMESTAMP
            WHERE id = ? AND rol = ? AND destinatario = ? AND leida_en IS NULL
            """, id, rol(authentication), authentication.getName());
        if (updated == 1) return ResponseEntity.noContent().build();
        boolean propia = Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS(SELECT 1 FROM notificacion_cita WHERE id = ? AND rol = ? AND destinatario = ?)
            """, Boolean.class, id, rol(authentication), authentication.getName()));
        return propia ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    private String rol(Authentication authentication) {
        return authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_JEFE_COORDINADORES"))
            ? "JEFE_COORDINADORES" : "COORDINADOR";
    }

    public record Notificacion(long id, String folio, String estudiante, String tramite,
                               LocalDate fecha, LocalTime hora, LocalDateTime creadaEn, boolean leida) {}
}
