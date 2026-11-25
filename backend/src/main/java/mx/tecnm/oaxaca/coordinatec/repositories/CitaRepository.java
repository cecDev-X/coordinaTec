package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;

@Repository
public interface CitaRepository extends JpaRepository<CitaEntity, String> {
    
    // Spring Data JPA crea la consulta SQL automáticamente basándose en el nombre del método
    Optional<CitaEntity> findByFolio(String folio);
    
    List<CitaEntity> findByNumControlEstudiante(String numControlEstudiante);

    @Query(value = "SELECT EXISTS (SELECT 1 FROM cita WHERE coordinador_rfc = :rfc AND fecha_programada = :fecha AND estado IN ('PROGRAMADA', 'PENDIENTE') AND folio <> :folio AND hora_inicio < :fin AND hora_fin > :inicio)", nativeQuery = true)
    boolean existsOverlap(@Param("rfc") String rfc, @Param("fecha") LocalDate fecha, @Param("inicio") LocalTime inicio, @Param("fin") LocalTime fin, @Param("folio") String folio);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE CitaEntity c SET c.estado = 'ATENDIDA', c.fechaAtencion = CURRENT_TIMESTAMP " +
        "WHERE c.folio = :folio AND c.estado = 'PROGRAMADA'")
    int marcarAtendida(@Param("folio") String folio);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = """
        UPDATE cita SET estado = 'CANCELADA'
        WHERE folio = :folio AND estado = 'PROGRAMADA'
          AND (:control IS NULL OR estudiante_numerocontrol = :control)
          AND (fecha_programada + hora_inicio) >
              (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City' +
                CASE WHEN :control IS NULL THEN INTERVAL '0 hours' ELSE INTERVAL '2 hours' END)
        """, nativeQuery = true)
    int cancelar(@Param("folio") String folio, @Param("control") String control);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = """
        UPDATE cita SET estado = 'NO_ASISTIO'
        WHERE folio = :folio AND estado = 'PROGRAMADA'
          AND (fecha_programada + hora_fin) <= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Mexico_City')
        """, nativeQuery = true)
    int marcarNoAsistio(@Param("folio") String folio);

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE estudiante
        SET suspendido_hasta = CASE
                WHEN inasistencias_acumuladas + 1 >= 2
                THEN CURRENT_TIMESTAMP + INTERVAL '30 days'
                ELSE suspendido_hasta
            END,
            inasistencias_acumuladas = CASE
                WHEN inasistencias_acumuladas + 1 >= 2 THEN 0
                ELSE inasistencias_acumuladas + 1
            END
        WHERE numerocontrol = :control
        """, nativeQuery = true)
    int registrarInasistencia(@Param("control") String control);

    @Query(value = """
        SELECT TO_CHAR(suspendido_hasta AT TIME ZONE 'America/Mexico_City', 'YYYY-MM-DD HH24:MI:SS')
        FROM estudiante
        WHERE numerocontrol = :control
          AND suspendido_hasta > CURRENT_TIMESTAMP
        """, nativeQuery = true)
    String suspensionActiva(@Param("control") String control);
}
