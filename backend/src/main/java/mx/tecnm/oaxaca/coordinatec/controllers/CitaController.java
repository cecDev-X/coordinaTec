package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.CambiarEstadoCitaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CitaResumenDTO;
import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private CitaConsultaRepository citaConsultaRepository;

    @GetMapping
    public List<CitaResumenDTO> listarCitas() {
        return citaConsultaRepository.listar();
    }

    @PostMapping
    public ResponseEntity<?> agendarCita(@RequestBody CitaEntity cita) {
        String folioGenerado = "FOL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        cita.setFolio(folioGenerado);
        cita.setEstado("PROGRAMADA");

        // Guarda la entidad directamente en la Base de Datos
        CitaEntity nuevaCita = citaRepository.save(cita);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCita);
    }

    @GetMapping("/{folio}")
    public ResponseEntity<?> obtenerDetalleCita(@PathVariable String folio) {
        return citaRepository.findByFolio(folio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{folio}/estado")
    public ResponseEntity<?> marcarCitaAtendida(@PathVariable String folio, @RequestBody CambiarEstadoCitaDTO request) {
        if (!"ATENDIDA".equals(request.estado())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Solo se permite marcar una cita como ATENDIDA"));
        }

        if (citaRepository.marcarAtendida(folio) == 0) {
            if (!citaRepository.existsById(folio)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La cita ya no está PROGRAMADA"));
        }

        return ResponseEntity.ok(Map.of("folio", folio, "estado", "ATENDIDA"));
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> listarCitasEstudiante(@PathVariable String numControl) {
        List<CitaEntity> citas = citaRepository.findByNumControlEstudiante(numControl);
        return ResponseEntity.ok(citas);
    }
}
