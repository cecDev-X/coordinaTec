package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.CambiarEstadoCitaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CitaResumenDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CrearCitaDTO;
import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CatalogoConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.DisponibilidadRepository;
import mx.tecnm.oaxaca.coordinatec.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(CitaController.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private CitaConsultaRepository citaConsultaRepository;

    @Autowired
    private CatalogoConsultaRepository catalogoConsultaRepository;

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @GetMapping
    public List<CitaResumenDTO> listarCitas() {
        return citaConsultaRepository.listar();
    }

    @PostMapping
    public ResponseEntity<?> agendarCita(@Valid @RequestBody CrearCitaDTO request) {
        if (!catalogoConsultaRepository.existeEstudiante(request.numControlEstudiante())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El estudiante seleccionado no existe"));
        }
        if (!catalogoConsultaRepository.existeCoordinador(request.coordinadorRfc())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El coordinador seleccionado no existe"));
        }
        if (!catalogoConsultaRepository.existeFormato(request.formatoFolio())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El formato seleccionado no existe"));
        }

        int duracionMinutos = catalogoConsultaRepository.obtenerDuracionFormato(request.formatoFolio());
        if (!disponibilidadRepository.listarDisponibilidad(
                request.coordinadorRfc(), request.fecha(), duracionMinutos
        ).contains(request.horaInicio().toString())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "Ese horario ya no está disponible; selecciona otro"));
        }

        int minutoFin = request.horaInicio().toSecondOfDay() / 60 + duracionMinutos;
        if (minutoFin >= 24 * 60) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "La duración del trámite excede el horario del día"));
        }

        CitaEntity cita = new CitaEntity();
        cita.setFecha(request.fecha());
        cita.setHoraInicio(request.horaInicio());
        cita.setHoraFin(request.horaInicio().plusMinutes(duracionMinutos));
        cita.setMotivo(request.motivo());
        cita.setCoordinadorRfc(request.coordinadorRfc());
        cita.setNumControlEstudiante(request.numControlEstudiante());
        cita.setFormatoFolio(request.formatoFolio());

        String folioGenerado = "FOL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        cita.setFolio(folioGenerado);
        cita.setEstado("PROGRAMADA");

        CitaEntity nuevaCita = citaRepository.save(cita);

        try {
            emailService.enviarConfirmacionCita(nuevaCita);
        } catch (MailException | IllegalStateException | IllegalArgumentException ex) {
            LOGGER.error(
                    "La cita {} se guardó, pero no se pudo enviar la confirmación.",
                    nuevaCita.getFolio(),
                    ex
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCita);
    }

    @GetMapping("/{folio}")
    public ResponseEntity<?> obtenerDetalleCita(@PathVariable String folio) {
        return citaRepository.findByFolio(folio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{folio}/estado")
    public ResponseEntity<?> marcarCitaAtendida(
            @PathVariable String folio,
            @RequestBody CambiarEstadoCitaDTO request
    ) {
        if (!"ATENDIDA".equals(request.estado())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("mensaje", "Solo se permite marcar una cita como ATENDIDA"));
        }

        if (citaRepository.marcarAtendida(folio) == 0) {
            if (!citaRepository.existsById(folio)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "La cita ya no está PROGRAMADA"));
        }

        return citaRepository.findByFolio(folio)
                .map(cita -> ResponseEntity.ok(Map.of(
                        "folio", folio,
                        "estado", cita.getEstado(),
                        "fechaAtencion", cita.getFechaAtencion()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> listarCitasEstudiante(@PathVariable String numControl) {
        List<CitaResumenDTO> citas = citaConsultaRepository.listarPorEstudiante(numControl);
        return ResponseEntity.ok(citas);
    }
}