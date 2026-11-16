package mx.tecnm.oaxaca.coordinatec.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class ProductionAdminBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private final String username;
    private final String password;

    public ProductionAdminBootstrap(JdbcTemplate jdbc, PasswordEncoder passwords,
            @Value("${coordinatec.bootstrap.admin.username:}") String username,
            @Value("${coordinatec.bootstrap.admin.password:}") String password) {
        this.jdbc = jdbc;
        this.passwords = passwords;
        this.username = username.trim();
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (username.isEmpty() && password.isEmpty()) return;
        if (username.isEmpty() || password.length() < 12) {
            throw new IllegalStateException("Bootstrap admin needs a username and a password of at least 12 characters");
        }
        // Never overwrite existing accounts or reset a password on restart.
        jdbc.update("""
            INSERT INTO jefe_coordinadores (username, nombre_completo, password_hash, activo)
            VALUES (?, 'Jefe(a) de Coordinación', ?, TRUE)
            ON CONFLICT (username) DO NOTHING
            """, username, passwords.encode(password));
        jdbc.update("""
            INSERT INTO departamento (nombre_area)
            SELECT 'Coordinación Académica'
            WHERE NOT EXISTS (SELECT 1 FROM departamento)
            """);
    }
}
