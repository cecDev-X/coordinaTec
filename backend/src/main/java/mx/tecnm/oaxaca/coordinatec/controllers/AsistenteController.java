package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import mx.tecnm.oaxaca.coordinatec.services.AsistenteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/asistente")
public class AsistenteController {
    private final AsistenteService service;

    public AsistenteController(AsistenteService service) {
        this.service = service;
    }

    @PostMapping("/consultar")
    public ResponseEntity<?> consultar(@Valid @RequestBody Consulta request, Authentication authentication) {
        return service.consultar(authentication.getName(), request);
    }

    public record Consulta(@NotBlank @Size(max = 500) String mensaje, @Size(max = 4) List<@Valid Turno> historial) {}
    public record Turno(@NotBlank @Size(max = 500) String pregunta, @NotBlank @Size(max = 1200) String respuesta) {}
}
