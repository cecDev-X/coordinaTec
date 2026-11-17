package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PasswordResetRepository {
    private final JdbcTemplate jdbc;

    public PasswordResetRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cuenta> buscarPorCorreo(String correo) {
        return jdbc.query("""
            SELECT numerocontrol, nombres, correo FROM estudiante
            WHERE LOWER(correo) = LOWER(?) ORDER BY numerocontrol LIMIT 5
            """, (rs, row) -> new Cuenta(rs.getString("numerocontrol"), rs.getString("nombres"), rs.getString("correo")), correo);
    }

    public boolean guardarToken(String numControl, String hash) {
        return jdbc.update("""
            INSERT INTO estudiante_password_reset (numerocontrol, token_hash, vence_en)
            VALUES (?, ?, CURRENT_TIMESTAMP + INTERVAL '30 minutes')
            ON CONFLICT (numerocontrol) DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                creado_en = CURRENT_TIMESTAMP,
                vence_en = EXCLUDED.vence_en,
                usado_en = NULL
            WHERE estudiante_password_reset.creado_en <= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
            """, numControl, hash) == 1;
    }

    public String bloquearTokenValido(String hash) {
        return jdbc.query("""
            SELECT numerocontrol FROM estudiante_password_reset
            WHERE token_hash = ? AND vence_en > CURRENT_TIMESTAMP AND usado_en IS NULL
            FOR UPDATE
            """, rs -> rs.next() ? rs.getString("numerocontrol") : null, hash);
    }

    public boolean tokenValido(String hash) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS (SELECT 1 FROM estudiante_password_reset
                WHERE token_hash = ? AND vence_en > CURRENT_TIMESTAMP AND usado_en IS NULL)
            """, Boolean.class, hash));
    }

    public void cambiarPassword(String numControl, String passwordHash) {
        jdbc.update("UPDATE estudiante SET password_hash = ? WHERE numerocontrol = ?", passwordHash, numControl);
        jdbc.update("UPDATE estudiante_password_reset SET usado_en = CURRENT_TIMESTAMP WHERE numerocontrol = ?", numControl);
    }

    public record Cuenta(String numControl, String nombres, String correo) {}
}
