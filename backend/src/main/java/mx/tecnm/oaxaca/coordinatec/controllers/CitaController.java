package mx.tecnm.oaxaca.coordinatec.controllers;


import mx.tecnm.oaxaca.coordinatec.dtos.CitaRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citas")
public class CitaController {

    @PostMapping
    public ResponseEntity<?> agendarCita(@RequestBody CitaRequestDTO dto) {
        String folioGenerado = "FOL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "folio", folioGenerado,
            "mensaje", "Cita agendada correctamente",
            "estado", "PROGRAMADA"
        ));
    }

    @GetMapping("/{folio}")
    public ResponseEntity<?> obtenerDetalleCita(@PathVariable String folio) {
        return ResponseEntity.ok(Map.of(
            "folio", folio,
            "fecha", "2026-10-25",
            "hora_inicio", "10:00",
            "motivo", "Revisión de retícula",
            "estado", "PROGRAMADA"
        ));
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> listarCitasEstudiante(@PathVariable String numControl) {
        return ResponseEntity.ok(List.of(
            Map.of("folio", "FOL-A123", "fecha", "2026-10-25", "hora", "10:00", "estado", "PROGRAMADA")
        ));
    }

    @PatchMapping("/{folio}/estado")
    public ResponseEntity<?> cambiarEstadoCita(@PathVariable String folio, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of("folio", folio, "mensaje", "Estado actualizado correctamente"));
    }

    @GetMapping("/reportes/atencion")
    public ResponseEntity<?> obtenerReporteAtencion() {
        return ResponseEntity.ok(Map.of(
          "totalCitas", 45,
          "atendidas", 40,
          "ausencias", 5
        ));
    }
}