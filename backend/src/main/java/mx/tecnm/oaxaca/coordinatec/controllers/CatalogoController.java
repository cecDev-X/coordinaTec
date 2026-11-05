package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.CitaCatalogosDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.CatalogoConsultaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/catalogos")
@CrossOrigin(origins = "http://localhost:5173")
public class CatalogoController {

    private final CatalogoConsultaRepository catalogos;

    public CatalogoController(CatalogoConsultaRepository catalogos) {
        this.catalogos = catalogos;
    }

    @GetMapping("/citas")
    public CitaCatalogosDTO obtenerCatalogosParaCita() {
        return new CitaCatalogosDTO(
            catalogos.listarEstudiantes(),
            catalogos.listarCoordinadores(),
            catalogos.listarFormatos()
        );
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> buscarEstudiante(@PathVariable String numControl) {
        return catalogos.buscarEstudiante(numControl)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                java.util.Map.of("mensaje", "No se encontró el número de control")
            ));
    }
}
