package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.repositories.CarreraTramiteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/carrera-tramites")
@CrossOrigin(origins = "http://localhost:5173")
public class CarreraTramiteController {
    private final CarreraTramiteRepository carreraTramites;

    public CarreraTramiteController(CarreraTramiteRepository carreraTramites) {
        this.carreraTramites = carreraTramites;
    }

    @GetMapping("/carreras")
    public ResponseEntity<?> listarCarreras(Authentication authentication) {
        boolean jefatura = tieneRol(authentication, "JEFE_COORDINADORES");
        return ResponseEntity.ok(carreraTramites.listarCarreras(authentication.getName(), jefatura));
    }

    @GetMapping("/{carrera}")
    public ResponseEntity<?> listarTramites(@PathVariable String carrera, Authentication authentication) {
        if (!carreraTramites.puedeAdministrar(authentication.getName(), tieneRol(authentication, "JEFE_COORDINADORES"), carrera)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "No puedes administrar trámites para esta carrera"));
        }
        return ResponseEntity.ok(carreraTramites.listarTramites(carrera));
    }

    @PutMapping("/{carrera}/{tramiteId}")
    public ResponseEntity<?> actualizar(@PathVariable String carrera, @PathVariable long tramiteId,
                                        @RequestBody Map<String, Boolean> request, Authentication authentication) {
        if (!carreraTramites.puedeAdministrar(authentication.getName(), tieneRol(authentication, "JEFE_COORDINADORES"), carrera)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "No puedes administrar trámites para esta carrera"));
        }
        Boolean habilitado = request.get("habilitado");
        if (habilitado == null) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Indica si el trámite debe estar habilitado"));
        }
        if (!carreraTramites.actualizar(carrera, tramiteId, habilitado)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La carrera o el trámite no existe o el trámite está desactivado en el catálogo global"));
        }
        return ResponseEntity.ok(Map.of("carrera", carrera, "tramiteId", tramiteId, "habilitado", habilitado));
    }

    private boolean tieneRol(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}
