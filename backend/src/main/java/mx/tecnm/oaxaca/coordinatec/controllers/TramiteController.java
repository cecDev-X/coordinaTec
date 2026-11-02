package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.TramiteRequestDTO;
import mx.tecnm.oaxaca.coordinatec.entities.TramiteEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.TramiteRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tramites")
@CrossOrigin(origins = "http://localhost:5173")
public class TramiteController {

    private final TramiteRepository tramites;

    public TramiteController(TramiteRepository tramites) {
        this.tramites = tramites;
    }

    @GetMapping
    public List<TramiteEntity> listar() {
        return tramites.findAllByOrderByNombreAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        return tramites.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody TramiteRequestDTO request) {
        TramiteEntity tramite = new TramiteEntity();
        aplicar(tramite, request);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(tramites.saveAndFlush(tramite));
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ya existe un trámite con ese nombre"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody TramiteRequestDTO request) {
        return tramites.findById(id)
            .<ResponseEntity<?>>map(tramite -> {
                aplicar(tramite, request);
                try {
                    return ResponseEntity.ok(tramites.saveAndFlush(tramite));
                } catch (DataIntegrityViolationException exception) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("mensaje", "Ya existe un trámite con ese nombre"));
                }
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!tramites.existsById(id)) return ResponseEntity.notFound().build();
        if (tramites.estaEnUso(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Este tipo está asociado a formatos; desactívalo en vez de eliminarlo"));
        }
        tramites.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void aplicar(TramiteEntity tramite, TramiteRequestDTO request) {
        tramite.setNombre(request.nombre().trim());
        tramite.setPeriodo(request.periodo());
        tramite.setDuracionMinutos(request.duracionMinutos());
        tramite.setRequisitos(request.requisitos().trim());
        tramite.setActivo(request.activo());
        tramite.setPrioridad(request.prioridad());
    }
}
