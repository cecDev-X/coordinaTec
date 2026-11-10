package mx.tecnm.oaxaca.coordinatec.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name = "coordinatec.demo.users.enabled", havingValue = "true")
public class DemoUsersSeeder implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;

    public DemoUsersSeeder(JdbcTemplate jdbc, PasswordEncoder passwords) {
        this.jdbc = jdbc;
        this.passwords = passwords;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        jdbc.update("INSERT INTO departamento (nombre_area) SELECT 'Departamento de demostración' WHERE NOT EXISTS (SELECT 1 FROM departamento WHERE nombre_area = 'Departamento de demostración')");
        Integer departmentId = jdbc.queryForObject("SELECT id FROM departamento WHERE nombre_area = 'Departamento de demostración' ORDER BY id LIMIT 1", Integer.class);
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, ?, ?, ?, ?) ON CONFLICT (numerocontrol) DO NOTHING",
            "DEMO0001", "Ana", "Ejemplo", "Ingeniería en Sistemas Computacionales", passwords.encode("Estudiante2026!"));
        jdbc.update("INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash) VALUES (?, ?, ?, ?, ?) ON CONFLICT (numerocontrol) DO NOTHING",
            "DEMO0002", "Luis", "Ejemplo", "Ingeniería Industrial", passwords.encode("Estudiante2026!"));

        jdbc.update("INSERT INTO jefe_coordinadores (username, nombre_completo, password_hash, activo) VALUES (?, ?, ?, TRUE) ON CONFLICT (username) DO NOTHING",
            "jefe@coordina.test", "Jefe de coordinadores", passwords.encode("JefeCoordina2026!"));
        crearCoordinador("TEST000000001", "Coordinador de Sistemas", "CoordinaSistemas2026!", "Ingeniería en Sistemas Computacionales", departmentId);
        crearCoordinador("TEST000000002", "Coordinadora de Industrial", "CoordinaIndustrial2026!", "Ingeniería Industrial", departmentId);
    }

    private void crearCoordinador(String rfc, String name, String password, String carrera, Integer departmentId) {
        jdbc.update("INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT (rfc) DO NOTHING",
            rfc, rfc, name, passwords.encode(password), departmentId);
        jdbc.update("INSERT INTO coordinador_carrera (coordinador_rfc, carrera) VALUES (?, ?) ON CONFLICT DO NOTHING", rfc, carrera);
    }
}
