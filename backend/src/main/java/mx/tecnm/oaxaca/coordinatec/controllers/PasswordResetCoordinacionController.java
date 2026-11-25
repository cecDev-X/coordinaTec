package mx.tecnm.oaxaca.coordinatec.controllers;

import jakarta.validation.Valid;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.RestablecerPasswordDTO;
import mx.tecnm.oaxaca.coordinatec.dtos.SolicitarRecuperacionCoordinacionDTO;
import mx.tecnm.oaxaca.coordinatec.services.PasswordResetCoordinacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/recuperacion-coordinacion")
public class PasswordResetCoordinacionController {
    private final PasswordResetCoordinacionService recuperacion;

    public PasswordResetCoordinacionController(PasswordResetCoordinacionService recuperacion) {
        this.recuperacion = recuperacion;
    }

    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitar(@Valid @RequestBody SolicitarRecuperacionCoordinacionDTO request) {
        if (!recuperacion.disponible()) return ResponseEntity.status(503)
            .body(Map.of("mensaje", "La recuperación por correo no está disponible por el momento."));
        recuperacion.solicitar(request.username(), request.correo());
        return ResponseEntity.ok(Map.of("mensaje", "Si los datos corresponden a una cuenta con correo de recuperación, recibirás un enlace para cambiar la contraseña."));
    }

    @PostMapping("/validar")
    public Map<String, Boolean> validar(@RequestBody Map<String, String> request) {
        return Map.of("valido", recuperacion.esValido(request.get("token")));
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmar(@Valid @RequestBody RestablecerPasswordDTO request) {
        if (!RegistroEstudianteDTO.esPasswordSegura(request.password())) return ResponseEntity.badRequest()
            .body(Map.of("mensaje", "La contraseña debe tener entre 8 y 72 caracteres, minúscula, mayúscula, número y signo especial."));
        if (!recuperacion.restablecer(request.token(), request.password())) return ResponseEntity.badRequest()
            .body(Map.of("mensaje", "El enlace es inválido, ya fue utilizado o venció. Solicita uno nuevo."));
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada. Ya puedes iniciar sesión."));
    }
}
