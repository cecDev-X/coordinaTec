package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteCuentaDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.EstudianteSesionDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.InicioSesionEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.EstudianteAuthRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/estudiantes")
@CrossOrigin(origins = "http://localhost:5173")
public class EstudianteAuthController {

    private final EstudianteAuthRepository estudiantes;
    private final PasswordEncoder passwordEncoder;

    public EstudianteAuthController(EstudianteAuthRepository estudiantes, PasswordEncoder passwordEncoder) {
        this.estudiantes = estudiantes;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/{numControl}")
    public ResponseEntity<?> obtenerPerfil(@PathVariable String numControl) {
        return estudiantes.buscarPorControl(numControl)
            .<ResponseEntity<?>>map(cuenta -> ResponseEntity.ok(perfil(cuenta)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroEstudianteDTO request) {
        String numControl = request.numControl().trim();
        if (estudiantes.existe(numControl)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ya existe una cuenta con ese número de control"));
        }

        try {
            estudiantes.registrar(request, passwordEncoder.encode(request.password()));
        } catch (DataIntegrityViolationException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", "Ya existe una cuenta con ese número de control"));
        }

        return estudiantes.buscarPorControl(numControl)
            .<ResponseEntity<?>>map(cuenta -> ResponseEntity.status(HttpStatus.CREATED).body(perfil(cuenta)))
            .orElseGet(() -> ResponseEntity.internalServerError()
                .body(Map.of("mensaje", "No se pudo recuperar la cuenta recién creada")));
    }

    @PostMapping("/sesion")
    public ResponseEntity<?> iniciarSesion(@Valid @RequestBody InicioSesionEstudianteDTO request) {
        return estudiantes.buscarPorControl(request.numControl().trim())
            .filter(cuenta -> passwordEncoder.matches(request.password(), cuenta.passwordHash()))
            .<ResponseEntity<?>>map(cuenta -> ResponseEntity.ok(perfil(cuenta)))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("mensaje", "Número de control o contraseña incorrectos")));
    }

    private EstudianteSesionDTO perfil(EstudianteCuentaDTO cuenta) {
        return new EstudianteSesionDTO(
            cuenta.numControl(),
            cuenta.nombres() + " " + cuenta.apellidos(),
            cuenta.carrera(),
            "ESTUDIANTE"
        );
    }
}
