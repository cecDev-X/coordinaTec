package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.HorarioRequestDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.DisponibilidadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/coordinadores")
@CrossOrigin(origins = "http://localhost:5173") // Habilita el acceso desde Vite
public class CoordinadorController {

    private final DisponibilidadRepository disponibilidad;

    public CoordinadorController(DisponibilidadRepository disponibilidad) {
        this.disponibilidad = disponibilidad;
    }

    @GetMapping("/{rfc}/horarios")
    public ResponseEntity<?> obtenerHorarios(@PathVariable String rfc) {
        return ResponseEntity.ok(disponibilidad.listarHorarios(rfc));
    }

    @PostMapping("/{rfc}/horarios")
    public ResponseEntity<?> crearHorario(@PathVariable String rfc, @RequestBody HorarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "mensaje", "Bloque de horario configurado exitosamente",
            "rfc", rfc
        ));
    }

    @GetMapping("/{rfc}/disponibilidad")
    public ResponseEntity<?> obtenerDisponibilidad(
        @PathVariable String rfc,
        @RequestParam String fecha,
        @RequestParam(defaultValue = "20") int duracionMinutos
    ) {
        if (duracionMinutos < 5 || duracionMinutos > 480) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La duración solicitada no es válida"));
        }
        try {
            return ResponseEntity.ok(disponibilidad.listarDisponibilidad(rfc, LocalDate.parse(fecha), duracionMinutos));
        } catch (java.time.format.DateTimeParseException exception) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La fecha debe tener formato AAAA-MM-DD"));
        }
    }

    @GetMapping("/departamentos")
    public ResponseEntity<?> obtenerDepartamentos() {
        return ResponseEntity.ok(List.of(
           Map.of("id", 1, "nombre", "Sistemas y Computación"),
           Map.of("id", 2, "nombre", "Industrial")
        ));
    }

    @GetMapping("/departamentos/{id}/coordinadores")
    public ResponseEntity<?> obtenerCoordinadoresPorDepartamento(@PathVariable Long id) {
        return ResponseEntity.ok(List.of(
           Map.of("rfc", "ABCD123456", "nombre", "Coordinador Sistemas")
        ));
    }
}
