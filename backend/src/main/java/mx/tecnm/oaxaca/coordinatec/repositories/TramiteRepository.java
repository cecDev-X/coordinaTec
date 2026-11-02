package mx.tecnm.oaxaca.coordinatec.repositories;

import mx.tecnm.oaxaca.coordinatec.entities.TramiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TramiteRepository extends JpaRepository<TramiteEntity, Long> {
    List<TramiteEntity> findAllByOrderByNombreAsc();

    @Query(value = "SELECT EXISTS (SELECT 1 FROM formato WHERE tramite_id = :tramiteId)", nativeQuery = true)
    boolean estaEnUso(@Param("tramiteId") Long tramiteId);
}
