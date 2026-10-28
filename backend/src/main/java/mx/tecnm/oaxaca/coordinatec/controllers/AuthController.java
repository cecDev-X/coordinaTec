package mx.tecnm.oaxaca.coordinatec.controllers;


import mx.tecnm.oaxaca.coordinatec.dtos.LoginRequestDTO; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        // Datos simulados (Mock)
        if ("estudiante".equals(request.getUsername()) && "12345".equals(request.getPassword())) {
            return ResponseEntity.ok(Map.of(
                "token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockTokenEstudiante",
                "rol", "ESTUDIANTE"
            ));
        }
        return ResponseEntity.status(401).body(Map.of("mensaje", "Credenciales incorrectas"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioLogueado() {
        return ResponseEntity.ok(Map.of(
            "username", "20260001",
            "nombre", "Santi",
            "rol", "ESTUDIANTE"
        ));
    }
}