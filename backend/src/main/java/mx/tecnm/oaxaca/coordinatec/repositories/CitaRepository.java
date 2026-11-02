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

@Repository
public interface CitaRepository extends JpaRepository<CitaEntity, String> {
    
    // Spring Data JPA crea la consulta SQL automáticamente basándose en el nombre del método
    Optional<CitaEntity> findByFolio(String folio);
    
    List<CitaEntity> findByNumControlEstudiante(String numControlEstudiante);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE CitaEntity c SET c.estado = 'ATENDIDA', c.fechaAtencion = CURRENT_TIMESTAMP " +
        "WHERE c.folio = :folio AND c.estado = 'PROGRAMADA'")
    int marcarAtendida(@Param("folio") String folio);
}
