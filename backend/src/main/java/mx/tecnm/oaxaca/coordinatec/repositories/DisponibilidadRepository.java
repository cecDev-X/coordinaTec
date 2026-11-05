package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class DisponibilidadRepository {

    private final JdbcTemplate jdbc;

    public DisponibilidadRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listarHorarios(String rfc) {
        return jdbc.query("""
            SELECT dia_semana, hora_inicio, hora_salida, duracion_minutos
            FROM horario
            WHERE coordinador_rfc = ?
            ORDER BY dia_semana, hora_inicio
            """, (rs, row) -> Map.of(
                "diaSemana", rs.getInt("dia_semana"),
                "horaInicio", rs.getObject("hora_inicio", LocalTime.class).toString(),
                "horaSalida", rs.getObject("hora_salida", LocalTime.class).toString(),
                "duracionMinutos", rs.getInt("duracion_minutos")
            ), rfc);
    }

    public List<String> listarDisponibilidad(String rfc, LocalDate fecha, int duracionCita) {
        if (duracionCita < 1 || jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM bloqueo_calendario WHERE coordinador_rfc = ? AND fecha_bloqueada = ?)",
            Boolean.class, rfc, fecha
        )) {
            return List.of();
        }

        int diaSemana = fecha.getDayOfWeek().getValue();
        List<BloqueHorario> horarios = jdbc.query("""
            SELECT hora_inicio, hora_salida, duracion_minutos
            FROM horario
            WHERE coordinador_rfc = ? AND dia_semana = ?
            ORDER BY hora_inicio
            """, (rs, row) -> new BloqueHorario(
                rs.getObject("hora_inicio", LocalTime.class),
                rs.getObject("hora_salida", LocalTime.class),
                rs.getInt("duracion_minutos")
            ), rfc, diaSemana);

        List<BloqueHorario> ocupadas = jdbc.query("""
            SELECT hora_inicio, hora_fin
            FROM cita
            WHERE coordinador_rfc = ? AND fecha_programada = ?
              AND estado IN ('PROGRAMADA', 'PENDIENTE')
            """, (rs, row) -> new BloqueHorario(
                rs.getObject("hora_inicio", LocalTime.class),
                rs.getObject("hora_fin", LocalTime.class),
                0
            ), rfc, fecha);

        List<String> disponibles = new ArrayList<>();
        LocalTime ahora = LocalTime.now();
        for (BloqueHorario horario : horarios) {
            for (LocalTime inicio = horario.inicio();
                 !inicio.plusMinutes(duracionCita).isAfter(horario.fin());
                 inicio = inicio.plusMinutes(horario.duracionMinutos())) {
                LocalTime inicioCandidato = inicio;
                LocalTime fin = inicioCandidato.plusMinutes(duracionCita);
                boolean yaPaso = fecha.equals(LocalDate.now()) && !inicioCandidato.isAfter(ahora);
                boolean seCruza = ocupadas.stream().anyMatch(ocupada ->
                    inicioCandidato.isBefore(ocupada.fin()) && fin.isAfter(ocupada.inicio())
                );
                if (!yaPaso && !seCruza) disponibles.add(inicioCandidato.toString());
            }
        }
        return disponibles;
    }

    private record BloqueHorario(LocalTime inicio, LocalTime fin, int duracionMinutos) {}
}
