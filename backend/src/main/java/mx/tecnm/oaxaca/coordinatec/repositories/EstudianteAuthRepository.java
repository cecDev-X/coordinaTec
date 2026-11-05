package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteCuentaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class EstudianteAuthRepository {

    private final JdbcTemplate jdbc;

    public EstudianteAuthRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<EstudianteCuentaDTO> buscarPorControl(String numControl) {
        return jdbc.query("""
            SELECT numerocontrol, nombres, apellidos, carrera, password_hash
            FROM estudiante
            WHERE numerocontrol = ?
            """, (rs, row) -> new EstudianteCuentaDTO(
                rs.getString("numerocontrol"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("carrera"),
                rs.getString("password_hash")
            ), numControl).stream().findFirst();
    }

    public boolean existe(String numControl) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM estudiante WHERE numerocontrol = ?)", Boolean.class, numControl
        ));
    }

    public void registrar(RegistroEstudianteDTO estudiante, String passwordHash) {
        jdbc.update("""
            INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, password_hash)
            VALUES (?, ?, ?, ?, ?)
            """, estudiante.numControl().trim(), estudiante.nombres().trim(), estudiante.apellidos().trim(),
            estudiante.carrera().trim(), passwordHash);
    }
}
