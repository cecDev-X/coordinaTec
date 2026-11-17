package mx.tecnm.oaxaca.coordinatec.repositories;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import mx.tecnm.oaxaca.coordinatec.dtos.HorarioRequestDTO;

@Repository
public class DisponibilidadRepository {

    private final JdbcTemplate jdbc;

    public DisponibilidadRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> listarHorarios(String rfc) {
        return jdbc.query("""
            SELECT h.id, h.dia_semana, h.hora_inicio, h.hora_salida,
                   COALESCE(array_agg(DISTINCT ht.tramite_id ORDER BY ht.tramite_id) FILTER (WHERE ht.tramite_id IS NOT NULL), ARRAY[]::bigint[]) AS tramite_ids,
                   COALESCE(array_agg(DISTINCT t.nombre ORDER BY t.nombre) FILTER (WHERE t.nombre IS NOT NULL), ARRAY[]::varchar[]) AS tramite_nombres
            FROM horario h
            LEFT JOIN horario_tramite ht ON ht.horario_id = h.id
            LEFT JOIN tramite t ON t.id = ht.tramite_id
            WHERE h.coordinador_rfc = ?
            GROUP BY h.id, h.dia_semana, h.hora_inicio, h.hora_salida
            ORDER BY h.dia_semana, h.hora_inicio
            """, (rs, row) -> {
                Object[] ids = (Object[]) rs.getArray("tramite_ids").getArray();
                List<Long> tramiteIds = java.util.Arrays.stream(ids).map(id -> ((Number) id).longValue()).toList();
                Object[] names = (Object[]) rs.getArray("tramite_nombres").getArray();
                List<String> tramiteNombres = java.util.Arrays.stream(names).map(String::valueOf).toList();
                return Map.of("diaSemana", rs.getInt("dia_semana"),
                    "horaInicio", rs.getObject("hora_inicio", LocalTime.class).toString(),
                    "horaSalida", rs.getObject("hora_salida", LocalTime.class).toString(), "tramiteIds", tramiteIds,
                    "tramites", tramiteNombres);
            }, rfc);
    }

    public void guardarHorarios(String rfc, List<HorarioRequestDTO> horarios) {
        // Una cita requiere un formato_folio. Crearlo al habilitar el trámite evita que
        // el estudiante vea el día pero no pueda consultar ni reservar ninguna hora.
        for (Long tramiteId : horarios.stream().flatMap(h -> h.tramiteIds().stream()).distinct().toList()) {
            jdbc.update("""
                INSERT INTO formato (folio, asunto, tipo_tramite, observaciones, tramite_id)
                SELECT 'AUTO-TRAMITE-' || t.id, LEFT(t.nombre, 150), LEFT(t.nombre, 100),
                       'Formato generado automáticamente para agendar citas', t.id
                FROM tramite t
                WHERE t.id = ? AND NOT EXISTS (SELECT 1 FROM formato f WHERE f.tramite_id = t.id)
                ON CONFLICT (folio) DO NOTHING
                """, tramiteId);
        }
        jdbc.update("DELETE FROM horario WHERE coordinador_rfc = ?", rfc);
        for (HorarioRequestDTO horario : horarios) {
            Integer horarioId = jdbc.queryForObject("""
                INSERT INTO horario (dia_semana, hora_inicio, hora_salida, coordinador_rfc)
                VALUES (?, ?, ?, ?) RETURNING id
                """, Integer.class, horario.diaSemana(), horario.horaInicio(), horario.horaSalida(), rfc);
            for (Long tramiteId : horario.tramiteIds().stream().distinct().toList()) {
                jdbc.update("INSERT INTO horario_tramite (horario_id, tramite_id) VALUES (?, ?)", horarioId, tramiteId);
            }
        }
    }

    public boolean existeCoordinador(String rfc) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM coordinador WHERE rfc = ?)", Boolean.class, rfc));
    }

    public boolean existeTramiteActivo(Long tramiteId) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS (SELECT 1 FROM tramite WHERE id = ? AND activo = TRUE)", Boolean.class, tramiteId));
    }

    public List<String> listarDisponibilidad(String rfc, LocalDate fecha, int duracionCita, Long tramiteId, String carrera) {
        if (duracionCita < 1 || jdbc.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM bloqueo_calendario WHERE coordinador_rfc = ? AND fecha_bloqueada = ?)",
            Boolean.class, rfc, fecha
        )) {
            return List.of();
        }

        int diaSemana = fecha.getDayOfWeek().getValue();
        List<BloqueHorario> horarios = jdbc.query("""
            SELECT h.hora_inicio, h.hora_salida
            FROM horario h
            WHERE h.coordinador_rfc = ? AND h.dia_semana = ?
              AND EXISTS (SELECT 1 FROM horario_tramite ht WHERE ht.horario_id = h.id AND ht.tramite_id = ?)
              AND EXISTS (SELECT 1 FROM coordinador_carrera cc WHERE cc.coordinador_rfc = h.coordinador_rfc AND cc.carrera = ?)
              AND EXISTS (SELECT 1 FROM carrera_tramite ct WHERE ct.carrera = ? AND ct.tramite_id = ? AND ct.habilitado = TRUE)
            ORDER BY h.hora_inicio
            """, (rs, row) -> new BloqueHorario(
                rs.getObject("hora_inicio", LocalTime.class),
                rs.getObject("hora_salida", LocalTime.class),
                0
            ), rfc, diaSemana, tramiteId, carrera, carrera, tramiteId);

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
                 inicio = inicio.plusMinutes(duracionCita)) {
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
