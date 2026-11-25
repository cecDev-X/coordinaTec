package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class VerificacionCorreoRepository {
    private final JdbcTemplate jdbc;

    public VerificacionCorreoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void guardarToken(String numControl, String hash) {
        jdbc.update("""
            INSERT INTO estudiante_verificacion_correo (numerocontrol, token_hash, vence_en)
            VALUES (?, ?, CURRENT_TIMESTAMP + INTERVAL '24 hours')
            ON CONFLICT (numerocontrol) DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                creado_en = CURRENT_TIMESTAMP,
                vence_en = EXCLUDED.vence_en
            """, numControl, hash);
    }

    public Optional<Cuenta> buscarCuentaSinVerificar(String numControl, String correo) {
        return jdbc.query("""
            SELECT e.numerocontrol, e.nombres, e.correo
            FROM estudiante e
            WHERE e.numerocontrol = ? AND LOWER(BTRIM(e.correo)) = LOWER(BTRIM(?))
              AND e.correo_verificado = FALSE
            """, (rs, row) -> new Cuenta(rs.getString("numerocontrol"), rs.getString("nombres"), rs.getString("correo")),
            numControl, correo).stream().findFirst();
    }

    public boolean guardarTokenReenvio(String numControl, String correo, String hash) {
        return jdbc.update("""
            UPDATE estudiante_verificacion_correo v
            SET token_hash = ?, creado_en = CURRENT_TIMESTAMP,
                vence_en = CURRENT_TIMESTAMP + INTERVAL '24 hours'
            FROM estudiante e
            WHERE v.numerocontrol = e.numerocontrol
              AND e.numerocontrol = ?
              AND LOWER(BTRIM(e.correo)) = LOWER(BTRIM(?))
              AND e.correo_verificado = FALSE
              AND v.creado_en <= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
            """, hash, numControl, correo) == 1;
    }

    public boolean confirmar(String hash) {
        String numControl = jdbc.query("""
            SELECT numerocontrol FROM estudiante_verificacion_correo
            WHERE token_hash = ? AND vence_en > CURRENT_TIMESTAMP
            FOR UPDATE
            """, rs -> rs.next() ? rs.getString(1) : null, hash);
        if (numControl == null) return false;
        int updated = jdbc.update("""
            UPDATE estudiante SET correo_verificado = TRUE
            WHERE numerocontrol = ? AND correo_verificado = FALSE
            """, numControl);
        jdbc.update("DELETE FROM estudiante_verificacion_correo WHERE numerocontrol = ?", numControl);
        return updated == 1;
    }

    public record Cuenta(String numControl, String nombres, String correo) {}
}
