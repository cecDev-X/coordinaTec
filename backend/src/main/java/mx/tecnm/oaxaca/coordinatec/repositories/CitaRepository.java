package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CitaRepository extends JpaRepository<CitaEntity, Long> {
    
    // Spring Data JPA crea la consulta SQL automáticamente basándose en el nombre del método
    Optional<CitaEntity> findByFolio(String folio);
    
    List<CitaEntity> findByNumControlEstudiante(String numControlEstudiante);
}
