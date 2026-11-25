package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteCuentaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public class EstudianteAuthRepository {

    private final JdbcTemplate jdbc;

    public EstudianteAuthRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<EstudianteCuentaDTO> buscarPorControl(String numControl) {
        return jdbc.query("""
            SELECT numerocontrol, nombres, apellidos, carrera, correo, password_hash, correo_verificado
            FROM estudiante
            WHERE numerocontrol = ?
            """, (rs, row) -> new EstudianteCuentaDTO(
                rs.getString("numerocontrol"),
                rs.getString("nombres"),
                rs.getString("apellidos"),
                rs.getString("carrera"),
                rs.getString("correo"),
                rs.getString("password_hash"),
                rs.getBoolean("correo_verificado")
            ), numControl).stream().findFirst();
    }

    public boolean existe(String numControl) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM estudiante WHERE numerocontrol = ?)", Boolean.class, numControl
        ));
    }

    public boolean existeCorreo(String correo) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM estudiante WHERE LOWER(BTRIM(correo)) = LOWER(BTRIM(?)))",
            Boolean.class, correo));
    }

    public List<String> listarCarreras() {
        return jdbc.queryForList("SELECT nombre FROM carrera ORDER BY nombre", String.class);
    }

    public boolean existeCarrera(String nombre) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM carrera WHERE nombre = ?)", Boolean.class, nombre));
    }

    public void registrar(RegistroEstudianteDTO estudiante, String passwordHash) {
        jdbc.update("""
            INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, correo, password_hash, correo_verificado)
            VALUES (?, ?, ?, ?, ?, ?, FALSE)
            """, estudiante.numControl().trim(), estudiante.nombres().trim(), estudiante.apellidos().trim(),
            estudiante.carrera().trim(), estudiante.correo().trim().toLowerCase(java.util.Locale.ROOT), passwordHash);
    }
}
