package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.HorarioRequestDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.DisponibilidadRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CatalogoConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CarreraTramiteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/coordinadores")
@CrossOrigin(origins = "http://localhost:5173") // Habilita el acceso desde Vite
public class CoordinadorController {

    private final DisponibilidadRepository disponibilidad;
    private final CatalogoConsultaRepository catalogos;
    private final CarreraTramiteRepository carreraTramites;

    public CoordinadorController(DisponibilidadRepository disponibilidad, CatalogoConsultaRepository catalogos,
                                 CarreraTramiteRepository carreraTramites) {
        this.disponibilidad = disponibilidad;
        this.catalogos = catalogos;
        this.carreraTramites = carreraTramites;
    }

    @GetMapping("/{rfc}/horarios")
    public ResponseEntity<?> obtenerHorarios(@PathVariable String rfc, Authentication authentication) {
        boolean jefatura = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_JEFE_COORDINADORES"));
        boolean coordinadorPropio = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_COORDINADOR"))
            && authentication.getName().equalsIgnoreCase(rfc);
        boolean estudianteAtendido = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_ESTUDIANTE"))
            && carreraTramites.estudiantePuedeConsultarHorario(authentication.getName(), rfc);
        if (!jefatura && !coordinadorPropio && !estudianteAtendido) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes consultar tu propio horario"));
        }
        return ResponseEntity.ok(disponibilidad.listarHorarios(rfc));
    }

    @PutMapping("/{rfc}/horarios")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> guardarHorarios(@PathVariable String rfc, @RequestBody List<@Valid HorarioRequestDTO> horarios, Authentication authentication) {
        if (authentication == null || (!authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_JEFE_COORDINADORES"))
            && !authentication.getName().equalsIgnoreCase(rfc))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes modificar tu propio horario"));
        }
        if (!disponibilidad.existeCoordinador(rfc)) return ResponseEntity.notFound().build();
        for (HorarioRequestDTO horario : horarios) {
            if (horario.horaInicio() == null || horario.horaSalida() == null || !horario.horaSalida().isAfter(horario.horaInicio())) {
                return ResponseEntity.badRequest().body(Map.of("mensaje", "La hora de salida debe ser posterior a la hora de inicio"));
            }
            for (Long tramiteId : horario.tramiteIds()) {
                if (!disponibilidad.existeTramiteActivo(tramiteId)) {
                    return ResponseEntity.badRequest().body(Map.of("mensaje", "Selecciona únicamente trámites activos"));
                }
            }
        }
        for (int i = 0; i < horarios.size(); i++) {
            HorarioRequestDTO actual = horarios.get(i);
            for (int j = i + 1; j < horarios.size(); j++) {
                HorarioRequestDTO otro = horarios.get(j);
                if (actual.diaSemana().equals(otro.diaSemana()) && actual.horaInicio().isBefore(otro.horaSalida()) && actual.horaSalida().isAfter(otro.horaInicio())) {
                    return ResponseEntity.badRequest().body(Map.of("mensaje", "Los bloques del mismo día no pueden traslaparse"));
                }
            }
        }
        disponibilidad.guardarHorarios(rfc, horarios);
        return ResponseEntity.ok(Map.of("mensaje", "Disponibilidad guardada", "rfc", rfc, "bloques", horarios.size()));
    }

    @GetMapping("/{rfc}/disponibilidad")
    public ResponseEntity<?> obtenerDisponibilidad(
        @PathVariable String rfc,
        @RequestParam String fecha,
        @RequestParam Long tramiteId,
        @RequestParam String carrera
    ) {
        if (!disponibilidad.existeTramiteActivo(tramiteId)) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El trámite solicitado no está activo"));
        }
        try {
            int duracionMinutos = catalogos.obtenerDuracionTramite(tramiteId);
            return ResponseEntity.ok(disponibilidad.listarDisponibilidad(rfc, LocalDate.parse(fecha), duracionMinutos, tramiteId, carrera));
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
