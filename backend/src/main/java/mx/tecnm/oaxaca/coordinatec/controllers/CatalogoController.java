package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.CitaCatalogosDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.CatalogoConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CarreraTramiteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalogos")
@CrossOrigin(origins = "http://localhost:5173")
public class CatalogoController {

    private final CatalogoConsultaRepository catalogos;
    private final CarreraTramiteRepository carreraTramites;

    public CatalogoController(CatalogoConsultaRepository catalogos, CarreraTramiteRepository carreraTramites) {
        this.catalogos = catalogos;
        this.carreraTramites = carreraTramites;
    }

    @GetMapping("/citas")
    public CitaCatalogosDTO obtenerCatalogosParaCita(Authentication authentication) {
        var estudiantes = catalogos.listarEstudiantes();
        if (authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ESTUDIANTE"))) {
            estudiantes = estudiantes.stream().filter(estudiante -> estudiante.numControl().equals(authentication.getName())).toList();
        } else if (authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_COORDINADOR"))) {
            estudiantes = catalogos.listarEstudiantesPorCoordinador(authentication.getName());
        }
        boolean estudiante = authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ESTUDIANTE"));
        List<Long> tramitesHabilitados = estudiante
            ? carreraTramites.listarIdsHabilitados(carreraTramites.obtenerCarreraEstudiante(authentication.getName()))
            : carreraTramites.listarIdsGlobalesActivos();
        return new CitaCatalogosDTO(
            estudiantes,
            catalogos.listarCoordinadores(authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_JEFE_COORDINADORES"))),
            catalogos.listarFormatos(),
            tramitesHabilitados
        );
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> buscarEstudiante(@PathVariable String numControl, Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ESTUDIANTE"))
            && !authentication.getName().equals(numControl)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("mensaje", "Solo puedes consultar tus datos"));
        }
        return catalogos.buscarEstudiante(numControl)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                java.util.Map.of("mensaje", "No se encontró el número de control")
            ));
    }
}
