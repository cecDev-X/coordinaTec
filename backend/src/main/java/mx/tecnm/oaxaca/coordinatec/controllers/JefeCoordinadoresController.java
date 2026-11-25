package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.CrearCoordinadorDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CrearJefaCoordinadoresDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

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

    @GetMapping("/agenda")
    @Transactional
    public ResponseEntity<?> obtenerAgendaPropia(org.springframework.security.core.Authentication authentication) {
        String username = authentication.getName();
        String nombre = jdbc.queryForObject("SELECT nombre_completo FROM jefe_coordinadores WHERE username = ? AND activo = TRUE", String.class, username);
        String rfc = "J" + HexFormat.of().formatHex(hash(username)).substring(0, 12).toUpperCase();
        Integer departamentoId = jdbc.query("SELECT id FROM departamento ORDER BY id LIMIT 1", rs -> rs.next() ? rs.getInt(1) : null);
        if (departamentoId == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "No hay un departamento configurado para crear la agenda"));
        }
        jdbc.update("""
            INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id, jefe_username)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (jefe_username) DO NOTHING
            """, rfc, "agenda-" + rfc, "Agenda de jefatura · " + nombre, passwordEncoder.encode(UUID.randomUUID().toString()), departamentoId, username);
        String agendaRfc = jdbc.queryForObject("SELECT rfc FROM coordinador WHERE jefe_username = ?", String.class, username);
        jdbc.update("""
            INSERT INTO coordinador_carrera (coordinador_rfc, carrera)
            SELECT ?, nombre FROM carrera ON CONFLICT DO NOTHING
            """, agendaRfc);
        return ResponseEntity.ok(Map.of("rfc", agendaRfc, "nombre", "Agenda de Jefatura", "username", username));
    }

    private byte[] hash(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible", exception);
        }
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
            WHERE c.jefe_username IS NULL
            GROUP BY c.rfc, c.nombre_completo ORDER BY c.nombre_completo
            """, (rs, row) -> Map.of("rfc", rs.getString("rfc"), "nombreCompleto", rs.getString("nombre_completo"), "carreras", rs.getArray("carreras").getArray()));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> crearCoordinador(@Valid @RequestBody CrearCoordinadorDTO request) {
        if (!nombreValido(request.nombreCompleto())) return ResponseEntity.badRequest()
            .body(Map.of("mensaje", "El nombre solo puede contener letras y espacios"));
        if (!RegistroEstudianteDTO.esPasswordSegura(request.password())) return ResponseEntity.badRequest()
            .body(Map.of("mensaje", "La contraseña necesita minúscula, mayúscula, número y carácter especial"));
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

    @PostMapping("/jefas")
    public ResponseEntity<?> crearJefa(@Valid @RequestBody CrearJefaCoordinadoresDTO request) {
        if (!RegistroEstudianteDTO.esPasswordSegura(request.password())) return ResponseEntity.badRequest()
            .body(Map.of("mensaje", "La contraseña necesita minúscula, mayúscula, número y carácter especial"));
        String username = request.username().trim();
        String nombre = request.nombreCompleto().trim();
        if (!nombreValido(nombre)) return ResponseEntity.badRequest().body(Map.of("mensaje", "El nombre solo puede contener letras y espacios"));
        boolean existe = Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (SELECT 1 FROM jefe_coordinadores WHERE lower(username) = lower(?))
                OR EXISTS (SELECT 1 FROM coordinador WHERE lower(username) = lower(?))
            """, Boolean.class, username, username));
        if (existe) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese usuario ya está registrado"));
        try {
            jdbc.update("INSERT INTO jefe_coordinadores (username, nombre_completo, password_hash, activo) VALUES (?, ?, ?, TRUE)",
                username, nombre, passwordEncoder.encode(request.password()));
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese usuario ya está registrado"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Cuenta de Jefe(a) de Coordinación creada", "username", username));
    }

    @PutMapping("/{rfc}")
    @Transactional
    public ResponseEntity<?> actualizarCoordinador(@PathVariable String rfc, @RequestBody Map<String, Object> request) {
        String key = rfc.trim().toUpperCase();
        String nombre = String.valueOf(request.getOrDefault("nombreCompleto", "")).trim();
        Object carrerasValue = request.get("carreras");
        if (nombre.length() > 150 || !nombreValido(nombre) || !(carrerasValue instanceof List<?> rawCarreras) || rawCarreras.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Nombre y al menos una carrera son obligatorios"));
        }
        List<String> carreras = rawCarreras.stream().map(String::valueOf).map(String::trim).distinct().toList();
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM coordinador WHERE rfc = ? AND jefe_username IS NULL)", Boolean.class, key))) return ResponseEntity.notFound().build();
        for (String carrera : carreras) {
            if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera))) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "La carrera no existe: " + carrera));
            }
        }
        jdbc.update("UPDATE coordinador SET nombre_completo = ? WHERE rfc = ?", nombre, key);
        Object password = request.get("password");
        if (password instanceof String value && !value.isBlank()) {
            if (!RegistroEstudianteDTO.esPasswordSegura(value)) return ResponseEntity.badRequest()
                .body(Map.of("mensaje", "La contraseña necesita minúscula, mayúscula, número y carácter especial"));
            jdbc.update("UPDATE coordinador SET password_hash = ? WHERE rfc = ?", passwordEncoder.encode(value), key);
        }
        jdbc.update("DELETE FROM coordinador_carrera WHERE coordinador_rfc = ?", key);
        carreras.forEach(carrera -> jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?)", key, carrera));
        return ResponseEntity.ok(Map.of("mensaje", "Coordinador actualizado"));
    }

    @DeleteMapping("/{rfc}")
    public ResponseEntity<?> eliminarCoordinador(@PathVariable String rfc) {
        try {
            int deleted = jdbc.update("DELETE FROM coordinador WHERE rfc = ? AND jefe_username IS NULL", rfc.trim().toUpperCase());
            if (deleted == 0) return ResponseEntity.notFound().build();
        } catch (org.springframework.dao.DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "No se puede eliminar: el coordinador tiene citas, horarios o bloqueos asignados"));
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alumnos")
    public List<Map<String, Object>> listarAlumnos() {
        return jdbc.query("SELECT numerocontrol, nombres, apellidos, carrera, COALESCE(correo, '') AS correo FROM estudiante ORDER BY apellidos, nombres, numerocontrol",
            (rs, row) -> Map.of("numControl", rs.getString("numerocontrol"), "nombres", rs.getString("nombres"),
                "apellidos", rs.getString("apellidos"), "nombre", rs.getString("nombres") + " " + rs.getString("apellidos"),
                "carrera", rs.getString("carrera"), "correo", rs.getString("correo")));
    }

    @PostMapping("/alumnos")
    public ResponseEntity<?> crearAlumno(@Valid @RequestBody RegistroEstudianteDTO request) {
        String control = request.numControl().trim();
        if (!RegistroEstudianteDTO.esPasswordSegura(request.password())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La contraseña debe incluir minúscula, mayúscula, número y signo especial"));
        }
        String carrera = request.carrera().trim();
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera))) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Selecciona una carrera válida"));
        }
        try {
            jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, correo, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
                control, request.nombres().trim(), request.apellidos().trim(), carrera, request.correo().trim(), passwordEncoder.encode(request.password()));
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ya existe un alumno con ese número de control"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Alumno creado"));
    }

    @PutMapping("/alumnos/{numControl}")
    public ResponseEntity<?> actualizarAlumno(@PathVariable String numControl, @RequestBody Map<String, String> request) {
        String nombres = request.getOrDefault("nombres", "").trim();
        String apellidos = request.getOrDefault("apellidos", "").trim();
        String carrera = request.getOrDefault("carrera", "").trim();
        String correo = request.getOrDefault("correo", "").trim();
        String password = request.getOrDefault("password", "");
        if (nombres.length() > 100 || apellidos.length() > 100
            || !nombres.matches("[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*")
            || !apellidos.matches("[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*")) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Nombres y apellidos son obligatorios (máximo 100 caracteres)"));
        }
        if (!Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, carrera))) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Selecciona una carrera válida"));
        }
        if (!correo.isEmpty() && (correo.length() > 254 || !correo.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Ingresa un correo electrónico válido"));
        }
        if (!password.isBlank() && !RegistroEstudianteDTO.esPasswordSegura(password)) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La contraseña debe tener entre 8 y 72 caracteres, minúscula, mayúscula, número y signo especial"));
        }
        int changed;
        try {
            changed = jdbc.update("UPDATE estudiante SET nombres = ?, apellidos = ?, carrera = ?, correo = CASE WHEN ? = '' THEN correo ELSE ? END WHERE numerocontrol = ?",
                nombres, apellidos, carrera, correo, correo, numControl);
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese correo electrónico ya está asociado a otra cuenta"));
        }
        if (changed == 0) return ResponseEntity.notFound().build();
        if (password != null && !password.isBlank()) jdbc.update("UPDATE estudiante SET password_hash = ? WHERE numerocontrol = ?", passwordEncoder.encode(password), numControl);
        return ResponseEntity.ok(Map.of("mensaje", "Alumno actualizado"));
    }

    @DeleteMapping("/alumnos/{numControl}")
    public ResponseEntity<?> eliminarAlumno(@PathVariable String numControl) {
        try {
            int deleted = jdbc.update("DELETE FROM estudiante WHERE numerocontrol = ?", numControl);
            if (deleted == 0) return ResponseEntity.notFound().build();
        } catch (org.springframework.dao.DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "No se puede eliminar: el alumno tiene citas registradas"));
        }
        return ResponseEntity.noContent().build();
    }

    private boolean nombreValido(String nombre) {
        return nombre != null && nombre.trim().matches("[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*");
    }
}
