package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteCuentaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteSesionDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.InicioSesionEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.EstudianteAuthRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.VerificacionCorreoRepository;
import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import mx.tecnm.oaxaca.coordinatec.notifications.WelcomeEmailService;
import mx.tecnm.oaxaca.coordinatec.services.RegistroEstudianteService;
import mx.tecnm.oaxaca.coordinatec.services.VerificacionCorreoService;
import mx.tecnm.oaxaca.coordinatec.dtos.ConfirmarCorreoDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.SolicitarVerificacionCorreoDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/v1/estudiantes")
@CrossOrigin(origins = "http://localhost:5173")
public class EstudianteAuthController {

    private final EstudianteAuthRepository estudiantes;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final WelcomeEmailService welcomeEmailService;
    private final RegistroEstudianteService registroService;
    private final VerificacionCorreoService verificacionService;
    private final VerificacionCorreoRepository verificacionRepository;

    public EstudianteAuthController(EstudianteAuthRepository estudiantes, PasswordEncoder passwordEncoder,
                                   JwtService jwtService, WelcomeEmailService welcomeEmailService,
                                   RegistroEstudianteService registroService, VerificacionCorreoService verificacionService,
                                   VerificacionCorreoRepository verificacionRepository) {
        this.estudiantes = estudiantes;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.welcomeEmailService = welcomeEmailService;
        this.registroService = registroService;
        this.verificacionService = verificacionService;
        this.verificacionRepository = verificacionRepository;
    }

    @GetMapping("/carreras")
    public List<String> listarCarreras() {
        return estudiantes.listarCarreras();
    }

    @GetMapping("/{numControl}")
    public ResponseEntity<?> obtenerPerfil(@PathVariable String numControl, Authentication authentication) {
        if (authentication == null || !authentication.getName().equals(numControl)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", "Solo puedes consultar tu perfil"));
        }
        return estudiantes.buscarPorControl(numControl)
            .<ResponseEntity<?>>map(cuenta -> ResponseEntity.ok(perfil(cuenta)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroEstudianteDTO request) {
        String numControl = request.numControl().trim();
        if (!welcomeEmailService.disponible()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("mensaje", "El registro con confirmación por correo no está disponible por el momento."));
        }
        if (!RegistroEstudianteDTO.esPasswordSegura(request.password())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "La contraseña debe tener entre 8 y 72 caracteres, minúscula, mayúscula, número y signo especial"));
        }
        if (!estudiantes.existeCarrera(request.carrera().trim())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Selecciona una carrera válida"));
        }
        if (estudiantes.existe(numControl)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ya existe una cuenta con ese número de control"));
        }
        if (estudiantes.existeCorreo(request.correo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ese correo electrónico ya está asociado a otra cuenta."));
        }

        RegistroEstudianteService.ConfirmacionPendiente pendiente;
        try {
            pendiente = registroService.registrar(request, passwordEncoder.encode(request.password()));
        } catch (DataIntegrityViolationException exception) {
            if (estudiantes.existeCorreo(request.correo())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "Ese correo electrónico ya está asociado a otra cuenta."));
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ya existe una cuenta con ese número de control"));
        }

        enviarVerificacion(pendiente.nombres(), pendiente.correo(), pendiente.token());
        return ResponseEntity.accepted().body(Map.of(
            "mensaje", "Cuenta creada. Revisa tu correo y confirma la dirección para poder iniciar sesión.",
            "correo", pendiente.correo()
        ));
    }

    @PostMapping("/verificacion/confirmar")
    public ResponseEntity<?> confirmarCorreo(@Valid @RequestBody ConfirmarCorreoDTO request) {
        if (!verificacionService.confirmar(request.token())) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El enlace de confirmación es inválido, venció o ya fue utilizado."));
        }
        return ResponseEntity.ok(Map.of("mensaje", "Correo confirmado. Ya puedes iniciar sesión en CoordinaTec."));
    }

    @PostMapping("/verificacion/reenviar")
    public ResponseEntity<?> reenviarVerificacion(@Valid @RequestBody SolicitarVerificacionCorreoDTO request) {
        if (!welcomeEmailService.disponible()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("mensaje", "El envío de correo no está disponible por el momento."));
        }
        verificacionService.reenviar(request.numControl(), request.correo())
            .flatMap(token -> verificacionRepository.buscarCuentaSinVerificar(request.numControl().trim(), request.correo().trim())
                .map(cuenta -> new RegistroEstudianteService.ConfirmacionPendiente(
                    cuenta.numControl(), cuenta.nombres(), cuenta.correo(), token)))
            .ifPresent(pendiente -> enviarVerificacion(pendiente.nombres(), pendiente.correo(), pendiente.token()));
        return ResponseEntity.accepted().body(Map.of(
            "mensaje", "Si los datos corresponden a una cuenta pendiente de confirmar, enviaremos un nuevo enlace. Revisa también correo no deseado."
        ));
    }

    @PostMapping("/sesion")
    public ResponseEntity<?> iniciarSesion(@Valid @RequestBody InicioSesionEstudianteDTO request) {
        var cuenta = estudiantes.buscarPorControl(request.numControl().trim())
            .filter(item -> passwordEncoder.matches(request.password(), item.passwordHash()));
        if (cuenta.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("mensaje", "Número de control o contraseña incorrectos"));
        if (!cuenta.get().correoVerificado()) return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("mensaje", "Confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja o solicita que te reenviemos el enlace."));
        return ResponseEntity.ok(perfil(cuenta.get()));
    }

    private void enviarVerificacion(String nombres, String correo, String token) {
        try {
            welcomeEmailService.enviarVerificacionCuenta(nombres, correo, token);
        } catch (TaskRejectedException exception) {
            // El registro queda pendiente; el estudiante podrá solicitar un nuevo enlace.
        }
    }

    private EstudianteSesionDTO perfil(EstudianteCuentaDTO cuenta) {
        return new EstudianteSesionDTO(
            cuenta.numControl(),
            cuenta.nombres() + " " + cuenta.apellidos(),
            cuenta.carrera(),
            cuenta.correo(),
            "ESTUDIANTE",
            jwtService.issue(cuenta.numControl(), "ESTUDIANTE")
        );
    }
}
