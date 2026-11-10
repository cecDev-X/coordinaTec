package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import mx.tecnm.oaxaca.coordinatec.dtos.LoginRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(JdbcTemplate jdbc, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        var user = jdbc.query("""
            SELECT username, nombre_completo, password_hash, 'JEFE_COORDINADORES' AS rol
            FROM jefe_coordinadores WHERE lower(username) = lower(?) AND activo = TRUE
            UNION ALL
            SELECT username, nombre_completo, password_hash, 'COORDINADOR' AS rol
            FROM coordinador WHERE lower(username) = lower(?)
            LIMIT 1
            """, (rs, row) -> new UserAccount(rs.getString("username"), rs.getString("nombre_completo"), rs.getString("password_hash"), rs.getString("rol")),
            request.getUsername().trim(), request.getUsername().trim()).stream().findFirst();

        if (user.isEmpty() || !passwordEncoder.matches(request.getPassword(), user.get().passwordHash())) {
            return ResponseEntity.status(401).body(Map.of("mensaje", "Usuario o contraseña incorrectos"));
        }
        UserAccount account = user.get();
        return ResponseEntity.ok(Map.of(
            "token", jwtService.issue(account.username(), account.role()),
            "username", account.username(), "nombre", account.name(), "rol", account.role()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioLogueado(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body(Map.of("mensaje", "Sesión no autenticada"));
        String role = authentication.getAuthorities().iterator().next().getAuthority().substring(5);
        if (!"JEFE_COORDINADORES".equals(role) && !"COORDINADOR".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("mensaje", "Acceso no autorizado"));
        }
        return jdbc.query("""
            SELECT username, nombre_completo FROM jefe_coordinadores WHERE username = ? AND ? = 'JEFE_COORDINADORES' AND activo = TRUE
            UNION ALL SELECT username, nombre_completo FROM coordinador WHERE username = ? AND ? = 'COORDINADOR'
            """, (rs, row) -> Map.of("username", rs.getString("username"), "nombre", rs.getString("nombre_completo"), "rol", authentication.getAuthorities().iterator().next().getAuthority().substring(5)),
            authentication.getName(), role, authentication.getName(), role).stream().findFirst()
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(401).body(Map.of("mensaje", "Sesión inválida")));
    }

    private record UserAccount(String username, String name, String passwordHash, String role) {}
}
