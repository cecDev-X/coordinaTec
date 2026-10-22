package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.HorarioRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coordinadores")
@CrossOrigin(origins = "http://localhost:5173") // Habilita el acceso desde Vite
public class CoordinadorController {

    @GetMapping("/{rfc}/horarios")
    public ResponseEntity<?> obtenerHorarios(@PathVariable String rfc) {
        return ResponseEntity.ok(List.of(
            Map.of("dia_semana", 1, "hora_inicio", "10:00", "hora_salida", "14:00", "duracion", 20)
        ));
    }

    @PostMapping("/{rfc}/horarios")
    public ResponseEntity<?> crearHorario(@PathVariable String rfc, @RequestBody HorarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "mensaje", "Bloque de horario configurado exitosamente",
            "rfc", rfc
        ));
    }

    @GetMapping("/{rfc}/disponibilidad")
    public ResponseEntity<?> obtenerDisponibilidad(@PathVariable String rfc, @RequestParam String fecha) {
        return ResponseEntity.ok(List.of("10:00", "10:20", "10:40", "11:00"));
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