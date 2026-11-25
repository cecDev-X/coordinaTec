package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/perfil")
public class PerfilController {
    private static final int MAX_IMAGE_BYTES = 2 * 1024 * 1024;
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;

    public PerfilController(JdbcTemplate jdbc, PasswordEncoder passwordEncoder) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> obtener(Authentication authentication) {
        Cuenta cuenta = buscarCuenta(authentication);
        if (cuenta == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La sesión no es válida."));
        String foto = jdbc.query("""
            SELECT 'data:' || tipo_contenido || ';base64,' || encode(contenido, 'base64')
            FROM foto_perfil_usuario WHERE username = ? AND rol = ?
            """, rs -> rs.next() ? rs.getString(1) : null, cuenta.username(), cuenta.rol());
        return ResponseEntity.ok(Map.of("username", cuenta.username(), "nombre", cuenta.nombre(), "rol", cuenta.rol(),
            "correoRecuperacion", cuenta.correo() == null ? "" : cuenta.correo(), "foto", foto == null ? "" : foto));
    }

    @PutMapping("/foto")
    public ResponseEntity<?> guardarFoto(@Valid @RequestBody FotoRequest request, Authentication authentication) {
        Cuenta cuenta = buscarCuenta(authentication);
        if (cuenta == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La sesión no es válida."));
        try {
            String[] parts = request.imagen().split(",", 2);
            if (parts.length != 2) throw new IllegalArgumentException();
            String mime = switch (parts[0]) {
                case "data:image/png;base64" -> "image/png";
                case "data:image/jpeg;base64" -> "image/jpeg";
                default -> throw new IllegalArgumentException();
            };
            byte[] bytes = Base64.getDecoder().decode(parts[1]);
            if (bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "La imagen debe pesar menos de 2 MB."));
            }
            var image = ImageIO.read(new ByteArrayInputStream(bytes));
            if (image == null || (long) image.getWidth() * image.getHeight() > 4_000_000L) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "El archivo no es una imagen PNG o JPEG válida."));
            }
            jdbc.update("""
                INSERT INTO foto_perfil_usuario (username, rol, contenido, tipo_contenido, actualizada_en)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT (username, rol) DO UPDATE SET
                    contenido = EXCLUDED.contenido,
                    tipo_contenido = EXCLUDED.tipo_contenido,
                    actualizada_en = CURRENT_TIMESTAMP
                """, cuenta.username(), cuenta.rol(), bytes, mime);
            return ResponseEntity.ok(Map.of("mensaje", "Fotografía de perfil actualizada.", "foto", request.imagen()));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Selecciona una imagen PNG o JPEG válida."));
        } catch (java.io.IOException exception) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "No se pudo leer el archivo de imagen."));
        }
    }

    @DeleteMapping("/foto")
    public ResponseEntity<?> eliminarFoto(Authentication authentication) {
        Cuenta cuenta = buscarCuenta(authentication);
        if (cuenta == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La sesión no es válida."));
        jdbc.update("DELETE FROM foto_perfil_usuario WHERE username = ? AND rol = ?", cuenta.username(), cuenta.rol());
        return ResponseEntity.ok(Map.of("mensaje", "Fotografía de perfil eliminada."));
    }

    @PutMapping("/contrasena")
    public ResponseEntity<?> cambiarContrasena(@Valid @RequestBody CambioContrasena request, Authentication authentication) {
        Cuenta cuenta = buscarCuenta(authentication);
        if (cuenta == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La sesión no es válida."));
        String hash = jdbc.query("""
            SELECT password_hash FROM estudiante WHERE numerocontrol = ? AND 'ESTUDIANTE' = ?
            UNION ALL
            SELECT password_hash FROM coordinador WHERE username = ? AND 'COORDINADOR' = ?
            UNION ALL
            SELECT password_hash FROM jefe_coordinadores WHERE username = ? AND 'JEFE_COORDINADORES' = ? AND activo = TRUE
            """, rs -> rs.next() ? rs.getString(1) : null,
            cuenta.username(), cuenta.rol(), cuenta.username(), cuenta.rol(), cuenta.username(), cuenta.rol());
        if (hash == null || !passwordEncoder.matches(request.contrasenaActual(), hash)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La contraseña actual es incorrecta."));
        }
        if (!RegistroEstudianteDTO.esPasswordSegura(request.contrasenaNueva())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La contraseña nueva debe tener entre 8 y 72 caracteres e incluir minúscula, mayúscula, número y símbolo."));
        }
        jdbc.update("""
            UPDATE estudiante SET password_hash = ? WHERE numerocontrol = ? AND ? = 'ESTUDIANTE'
            """, passwordEncoder.encode(request.contrasenaNueva()), cuenta.username(), cuenta.rol());
        jdbc.update("""
            UPDATE coordinador SET password_hash = ? WHERE username = ? AND ? = 'COORDINADOR'
            """, passwordEncoder.encode(request.contrasenaNueva()), cuenta.username(), cuenta.rol());
        jdbc.update("""
            UPDATE jefe_coordinadores SET password_hash = ? WHERE username = ? AND ? = 'JEFE_COORDINADORES'
            """, passwordEncoder.encode(request.contrasenaNueva()), cuenta.username(), cuenta.rol());
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente."));
    }

    @PutMapping("/correo-recuperacion")
    public ResponseEntity<?> actualizarCorreo(@Valid @RequestBody CorreoRecuperacionRequest request, Authentication authentication) {
        Cuenta cuenta = buscarCuenta(authentication);
        if (cuenta == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "La sesión no es válida."));
        String hash = obtenerHash(cuenta);
        if (hash == null || !passwordEncoder.matches(request.contrasenaActual(), hash)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La contraseña actual es incorrecta."));
        }
        try {
            int updated = switch (cuenta.rol()) {
                case "COORDINADOR" -> jdbc.update("UPDATE coordinador SET correo_recuperacion = ? WHERE username = ?", request.correo().trim().toLowerCase(java.util.Locale.ROOT), cuenta.username());
                case "JEFE_COORDINADORES" -> jdbc.update("UPDATE jefe_coordinadores SET correo_recuperacion = ? WHERE username = ?", request.correo().trim().toLowerCase(java.util.Locale.ROOT), cuenta.username());
                default -> 0;
            };
            if (updated == 0) return ResponseEntity.badRequest().body(Map.of("mensaje", "No se pudo actualizar el correo de recuperación."));
            return ResponseEntity.ok(Map.of("mensaje", "Correo de recuperación actualizado.", "correoRecuperacion", request.correo().trim().toLowerCase(java.util.Locale.ROOT)));
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "Ese correo ya está asociado a otra cuenta de coordinación."));
        }
    }

    private String obtenerHash(Cuenta cuenta) {
        return jdbc.query("""
            SELECT password_hash FROM coordinador WHERE username = ? AND ? = 'COORDINADOR'
            UNION ALL SELECT password_hash FROM jefe_coordinadores
            WHERE username = ? AND ? = 'JEFE_COORDINADORES' AND activo = TRUE
            """, rs -> rs.next() ? rs.getString(1) : null,
            cuenta.username(), cuenta.rol(), cuenta.username(), cuenta.rol());
    }

    private Cuenta buscarCuenta(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().isEmpty()) return null;
        String role = authentication.getAuthorities().iterator().next().getAuthority().replaceFirst("^ROLE_", "");
        return jdbc.query("""
            SELECT numerocontrol AS username, concat_ws(' ', nombres, apellidos) AS nombre, correo
            FROM estudiante WHERE numerocontrol = ? AND ? = 'ESTUDIANTE'
            UNION ALL
            SELECT username, nombre_completo AS nombre, correo_recuperacion AS correo FROM coordinador
            WHERE username = ? AND ? = 'COORDINADOR'
            UNION ALL
            SELECT username, nombre_completo AS nombre, correo_recuperacion AS correo FROM jefe_coordinadores
            WHERE username = ? AND ? = 'JEFE_COORDINADORES' AND activo = TRUE
            """, rs -> rs.next() ? new Cuenta(rs.getString("username"), rs.getString("nombre"), role, rs.getString("correo")) : null,
            authentication.getName(), role, authentication.getName(), role, authentication.getName(), role);
    }

    private record Cuenta(String username, String nombre, String rol, String correo) {}
    public record FotoRequest(@NotBlank @Size(max = 3_000_000) String imagen) {}
    public record CambioContrasena(@NotBlank @Size(max = 72) String contrasenaActual,
                                  @NotBlank @Size(min = 8, max = 72) String contrasenaNueva) {}
    public record CorreoRecuperacionRequest(@NotBlank @Email @Size(max = 254) String correo,
                                            @NotBlank @Size(max = 72) String contrasenaActual) {}
}
