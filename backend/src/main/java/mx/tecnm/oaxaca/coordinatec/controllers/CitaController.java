package mx.tecnm.oaxaca.coordinatec.controllers;

import mx.tecnm.oaxaca.coordinatec.dtos.CambiarEstadoCitaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.ActualizarCitaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CrearCitaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.CitaResumenDTO;
import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CatalogoConsultaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.DisponibilidadRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.CarreraTramiteRepository;
import mx.tecnm.oaxaca.coordinatec.notifications.CitaConfirmationEmailService;
import mx.tecnm.oaxaca.coordinatec.repositories.CitaConsultaRepository.ConfirmacionCita;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {
    private static final Logger log = LoggerFactory.getLogger(CitaController.class);

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private CitaConsultaRepository citaConsultaRepository;

    @Autowired
    private CatalogoConsultaRepository catalogoConsultaRepository;

    @Autowired
    private DisponibilidadRepository disponibilidadRepository;

    @Autowired
    private CarreraTramiteRepository carreraTramiteRepository;

    @Autowired
    private CitaConfirmationEmailService citaEmailService;

    @GetMapping
    public List<CitaResumenDTO> listarCitas() {
        return citaConsultaRepository.listar();
    }

    @PostMapping
    public ResponseEntity<?> agendarCita(@Valid @RequestBody CrearCitaDTO request, Authentication authentication) {
        if (tieneRol(authentication, "ESTUDIANTE") && !authentication.getName().equals(request.numControlEstudiante())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes agendar tus propias citas"));
        }
        if (tieneRol(authentication, "COORDINADOR") && !authentication.getName().equalsIgnoreCase(request.coordinadorRfc())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes agendar citas de tu coordinación"));
        }
        if (!catalogoConsultaRepository.existeEstudiante(request.numControlEstudiante())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El estudiante seleccionado no existe"));
        }
        if (!catalogoConsultaRepository.existeCoordinador(request.coordinadorRfc())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El coordinador seleccionado no existe"));
        }
        if (!citaConsultaRepository.coordinadorAtiendeEstudiante(request.coordinadorRfc(), request.numControlEstudiante())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El coordinador no atiende la carrera del estudiante"));
        }
        if (!catalogoConsultaRepository.existeFormato(request.formatoFolio())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El formato seleccionado no existe"));
        }

        int duracionMinutos = catalogoConsultaRepository.obtenerDuracionFormato(request.formatoFolio());
        Long tramiteId = catalogoConsultaRepository.obtenerTramiteIdFormato(request.formatoFolio());
        String carreraEstudiante = carreraTramiteRepository.obtenerCarreraEstudiante(request.numControlEstudiante());
        if (!carreraTramiteRepository.estaHabilitado(carreraEstudiante, tramiteId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Este trámite no está habilitado para la carrera del estudiante"));
        }
        if (!disponibilidadRepository.listarDisponibilidad(
            request.coordinadorRfc(), request.fecha(), duracionMinutos, tramiteId, carreraEstudiante
        ).contains(request.horaInicio().toString())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ese horario ya no está disponible; selecciona otro"));
        }
        int minutoFin = request.horaInicio().toSecondOfDay() / 60 + duracionMinutos;
        if (minutoFin >= 24 * 60) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La duración del trámite excede el horario del día"));
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

        // Guarda la entidad directamente en la Base de Datos
        CitaEntity nuevaCita = citaRepository.saveAndFlush(cita);

        try {
            citaConsultaRepository.obtenerConfirmacion(nuevaCita.getFolio()).ifPresent(confirmacion -> {
                if (confirmacion.correo() == null || confirmacion.correo().isBlank()) return;
                if (TransactionSynchronizationManager.isActualTransactionActive()
                    && TransactionSynchronizationManager.isSynchronizationActive()) {
                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            enviarConfirmacion(confirmacion);
                        }
                    });
                } else {
                    enviarConfirmacion(confirmacion);
                }
            });
        } catch (RuntimeException exception) {
            // La cita ya se guardó. Un fallo de notificación no debe cambiar la respuesta a error.
            log.warn("La cita se guardó, pero no se pudo programar el correo de confirmación", exception);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCita);
    }

    private void enviarConfirmacion(ConfirmacionCita confirmacion) {
        try {
            citaEmailService.enviarConfirmacion(confirmacion);
        } catch (RuntimeException exception) {
            log.warn("La cita se guardó, pero no se pudo poner en cola el correo de confirmación", exception);
        }
    }

    @GetMapping("/{folio}")
    public ResponseEntity<?> obtenerDetalleCita(@PathVariable String folio, Authentication authentication) {
        if (tieneRol(authentication, "ESTUDIANTE") && !citaConsultaRepository.estudianteTieneCita(authentication.getName(), folio)
            || tieneRol(authentication, "COORDINADOR") && !citaConsultaRepository.coordinadorTieneCita(authentication.getName(), folio)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "No tienes acceso a esta cita"));
        }
        return citaRepository.findByFolio(folio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/coordinador/{rfc}")
    public ResponseEntity<?> listarCitasCoordinador(@PathVariable String rfc, Authentication authentication) {
        if (authentication == null || (!tieneRol(authentication, "JEFE_COORDINADORES") && !authentication.getName().equalsIgnoreCase(rfc))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes consultar tus propias citas"));
        }
        if (!catalogoConsultaRepository.existeCoordinador(rfc)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(citaConsultaRepository.listarPorCoordinador(rfc));
    }

    @PatchMapping("/{folio}/estado")
    public ResponseEntity<?> marcarCitaAtendida(@PathVariable String folio, @RequestBody CambiarEstadoCitaDTO request, Authentication authentication) {
        if (tieneRol(authentication, "COORDINADOR")
            && !citaConsultaRepository.coordinadorTieneCita(authentication.getName(), folio)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "No tienes acceso a esta cita"));
        }
        if (!"ATENDIDA".equals(request.estado())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Solo se permite marcar una cita como ATENDIDA"));
        }

        if (citaRepository.marcarAtendida(folio) == 0) {
            if (!citaRepository.existsById(folio)) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "La cita ya no está PROGRAMADA"));
        }

        return citaRepository.findByFolio(folio)
                .map(cita -> ResponseEntity.ok(Map.of(
                    "folio", folio,
                    "estado", cita.getEstado(),
                    "fechaAtencion", cita.getFechaAtencion()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{folio}")
    public ResponseEntity<?> actualizarCita(@PathVariable String folio, @Valid @RequestBody ActualizarCitaDTO request, Authentication authentication) {
        if (!tieneRol(authentication, "JEFE_COORDINADORES")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo jefatura puede editar citas"));
        }
        CitaEntity cita = citaRepository.findByFolio(folio).orElse(null);
        if (cita == null) return ResponseEntity.notFound().build();
        if (!catalogoConsultaRepository.existeEstudiante(request.numControlEstudiante())
            || !catalogoConsultaRepository.existeCoordinador(request.coordinadorRfc())
            || !catalogoConsultaRepository.existeFormato(request.formatoFolio())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Estudiante, coordinador o formato inválido"));
        }
        if (!citaConsultaRepository.coordinadorAtiendeEstudiante(request.coordinadorRfc(), request.numControlEstudiante())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El coordinador no atiende la carrera del estudiante"));
        }
        int duration = catalogoConsultaRepository.obtenerDuracionFormato(request.formatoFolio());
        var end = request.horaInicio().plusMinutes(duration);
        if (end.isBefore(request.horaInicio()) || end.equals(request.horaInicio())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La duración excede el horario del día"));
        }
        Boolean conflict = citaRepository.existsOverlap(request.coordinadorRfc(), request.fecha(), request.horaInicio(), end, folio);
        if (Boolean.TRUE.equals(conflict)) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", "El horario se cruza con otra cita"));
        cita.setFecha(request.fecha());
        cita.setHoraInicio(request.horaInicio());
        cita.setHoraFin(end);
        cita.setMotivo(request.motivo());
        cita.setCoordinadorRfc(request.coordinadorRfc());
        cita.setNumControlEstudiante(request.numControlEstudiante());
        cita.setFormatoFolio(request.formatoFolio());
        return ResponseEntity.ok(citaRepository.save(cita));
    }

    @DeleteMapping("/{folio}")
    public ResponseEntity<?> eliminarCita(@PathVariable String folio, Authentication authentication) {
        if (!tieneRol(authentication, "JEFE_COORDINADORES")) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        if (!citaRepository.existsById(folio)) return ResponseEntity.notFound().build();
        citaRepository.deleteById(folio);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estudiantes/{numControl}")
    public ResponseEntity<?> listarCitasEstudiante(@PathVariable String numControl, Authentication authentication) {
        if (authentication == null || !authentication.getName().equals(numControl)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes consultar tus propias citas"));
        }
        List<CitaResumenDTO> citas = citaConsultaRepository.listarPorEstudiante(numControl);
        return ResponseEntity.ok(citas);
    }

    private boolean tieneRol(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}
