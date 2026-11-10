package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.CrearCoordinadorDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jefe-coordinadores")
@CrossOrigin(origins = "http://localhost:5173")
public class JefeCoordinadoresController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public JefeCoordinadoresController(JdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/carreras")
    public List<String> listarCarreras() {
        return jdbc.queryForList("SELECT nombre FROM carrera ORDER BY nombre", String.class);
    }

    @PostMapping("/carreras")
    public ResponseEntity<?> crearCarrera(@RequestBody Map<String, String> request) {
        String nombre = request.getOrDefault("nombre", "").trim();
        if (nombre.isEmpty() || nombre.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El nombre debe tener entre 1 y 100 caracteres"));
        }
        int inserted = jdbc.update("INSERT INTO carrera (nombre) VALUES (?) ON CONFLICT DO NOTHING", nombre);
        if (inserted == 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La carrera ya existe"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Carrera creada"));
    }

    @PutMapping("/carreras/{nombre}")
    @Transactional
    public ResponseEntity<?> actualizarCarrera(@PathVariable String nombre, @RequestBody Map<String, String> request) {
        String actual = nombre.trim();
        String nuevo = request.getOrDefault("nombre", "").trim();
        if (nuevo.isEmpty() || nuevo.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El nombre debe tener entre 1 y 100 caracteres"));
        }
        if (actual.equals(nuevo)) return ResponseEntity.ok(Map.of("mensaje", "Sin cambios"));
        if (Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, nuevo))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ya existe una carrera con ese nombre"));
        }
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, actual))) {
            return ResponseEntity.notFound().build();
        }
        jdbc.update("INSERT INTO carrera (nombre) VALUES (?)", nuevo);
        jdbc.update("UPDATE estudiante SET carrera = ? WHERE carrera = ?", nuevo, actual);
        jdbc.update("UPDATE coordinador_carrera SET carrera = ? WHERE carrera = ?", nuevo, actual);
        jdbc.update("DELETE FROM carrera WHERE nombre = ?", actual);
        return ResponseEntity.ok(Map.of("mensaje", "Carrera actualizada"));
    }

    @DeleteMapping("/carreras/{nombre}")
    public ResponseEntity<?> eliminarCarrera(@PathVariable String nombre) {
        try {
            int deleted = jdbc.update("DELETE FROM carrera WHERE nombre = ?", nombre.trim());
            if (deleted == 0) return ResponseEntity.notFound().build();
        } catch (org.springframework.dao.DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "No se puede eliminar: la carrera tiene estudiantes o coordinadores asignados"));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Carrera eliminada"));
    }

    @GetMapping
    public List<Map<String, Object>> listarCoordinadores() {
        return jdbc.query("""
            SELECT c.rfc, c.nombre_completo,
                   COALESCE(array_agg(cc.carrera) FILTER (WHERE cc.carrera IS NOT NULL), ARRAY[]::varchar[]) AS carreras
            FROM coordinador c LEFT JOIN coordinador_carrera cc ON cc.coordinador_rfc = c.rfc
            GROUP BY c.rfc, c.nombre_completo ORDER BY c.nombre_completo
            """, (rs, row) -> Map.of("rfc", rs.getString("rfc"), "nombreCompleto", rs.getString("nombre_completo"), "carreras", rs.getArray("carreras").getArray()));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearCoordinador(@Valid @RequestBody CrearCoordinadorDTO request) {
        String rfc = request.rfc().trim().toUpperCase();
        List<String> carreras = request.carreras().stream().map(String::trim).distinct().toList();
        if (carreras.isEmpty() || carreras.stream().anyMatch(String::isEmpty)) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Asigna al menos una carrera válida"));
        }
        String carreraNoRegistrada = carreras.stream().filter(carrera -> !jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera)).findFirst().orElse(null);
        if (carreraNoRegistrada != null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La carrera no existe: " + carreraNoRegistrada));
        }
        if (Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM jefe_coordinadores WHERE lower(username) = lower(?))", Boolean.class, rfc))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese RFC está reservado por otra cuenta"));
        }
        try {
            Integer departamentoId = jdbc.queryForObject("SELECT id FROM departamento ORDER BY id LIMIT 1", Integer.class);
            int inserted = jdbc.update("INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING",
                rfc, rfc, request.nombreCompleto().trim(), passwordEncoder.encode(request.password()), departamentoId);
            if (inserted == 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ya existe un coordinador con ese RFC"));
            }
            for (String carrera : carreras) {
                jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?)", rfc, carrera);
            }
        } catch (org.springframework.dao.EmptyResultDataAccessException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Primero debe existir al menos un departamento"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Coordinador creado y carreras asignadas"));
    }
}
