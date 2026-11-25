package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PasswordResetCoordinacionRepository {
    private final JdbcTemplate jdbc;

    public PasswordResetCoordinacionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Cuenta> buscarCuenta(String username, String correo) {
        return jdbc.query("""
            SELECT username, nombre_completo, correo_recuperacion, 'COORDINADOR' AS rol
            FROM coordinador
            WHERE LOWER(username) = LOWER(?) AND LOWER(BTRIM(correo_recuperacion)) = LOWER(BTRIM(?))
            UNION ALL
            SELECT username, nombre_completo, correo_recuperacion, 'JEFE_COORDINADORES' AS rol
            FROM jefe_coordinadores
            WHERE LOWER(username) = LOWER(?) AND LOWER(BTRIM(correo_recuperacion)) = LOWER(BTRIM(?))
              AND activo = TRUE
            LIMIT 1
            """, (rs, row) -> new Cuenta(rs.getString("username"), rs.getString("nombre_completo"),
            rs.getString("correo_recuperacion"), rs.getString("rol")),
            username.trim(), correo.trim(), username.trim(), correo.trim()).stream().findFirst();
    }

    public boolean guardarToken(String username, String rol, String hash) {
        return jdbc.update("""
            INSERT INTO cuenta_coordinacion_password_reset (username, rol, token_hash, vence_en)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '30 minutes')
            ON CONFLICT (username, rol) DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                creado_en = CURRENT_TIMESTAMP,
                vence_en = EXCLUDED.vence_en,
                usado_en = NULL
            WHERE cuenta_coordinacion_password_reset.creado_en <= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
            """, username, rol, hash) == 1;
    }

    public String bloquearTokenValido(String hash) {
        return jdbc.query("""
            SELECT username || '|' || rol
            FROM cuenta_coordinacion_password_reset
            WHERE token_hash = ? AND vence_en > CURRENT_TIMESTAMP AND usado_en IS NULL
            FOR UPDATE
            """, rs -> rs.next() ? rs.getString(1) : null, hash);
    }

    public boolean tokenValido(String hash) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (SELECT 1 FROM cuenta_coordinacion_password_reset
                WHERE token_hash = ? AND vence_en > CURRENT_TIMESTAMP AND usado_en IS NULL)
            """, Boolean.class, hash));
    }

    public void cambiarPassword(String username, String rol, String hash) {
        if ("COORDINADOR".equals(rol)) {
            jdbc.update("UPDATE coordinador SET password_hash = ? WHERE username = ?", hash, username);
        } else {
            jdbc.update("UPDATE jefe_coordinadores SET password_hash = ? WHERE username = ? AND activo = TRUE", hash, username);
        }
        jdbc.update("""
            UPDATE cuenta_coordinacion_password_reset SET usado_en = CURRENT_TIMESTAMP
            WHERE username = ? AND rol = ?
            """, username, rol);
    }

    public record Cuenta(String username, String nombre, String correo, String rol) {}
}
