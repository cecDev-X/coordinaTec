package mx.tecnm.oaxaca.coordinatec.services;

import mx.tecnm.oaxaca.coordinatec.notifications.WelcomeEmailService;
import mx.tecnm.oaxaca.coordinatec.repositories.PasswordResetRepository;
import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {
    private final PasswordResetRepository repository;
    private final WelcomeEmailService correo;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetService(PasswordResetRepository repository, WelcomeEmailService correo, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.correo = correo;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean disponible() {
        return correo.disponible();
    }

    public void solicitar(String email) {
        // Respuesta idéntica para correos existentes y desconocidos; no revelar cuentas.
        for (PasswordResetRepository.Cuenta cuenta : repository.buscarPorCorreo(email.trim())) {
            byte[] bytes = new byte[32];
            random.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            if (repository.guardarToken(cuenta.numControl(), hash(token))) {
                correo.enviarRecuperacion(cuenta.nombres(), cuenta.correo(), cuenta.numControl(), token);
            }
        }
    }

    public boolean esValido(String token) {
        return tieneFormatoValido(token) && repository.tokenValido(hash(token));
    }

    @Transactional
    public boolean restablecer(String token, String nuevaPassword) {
        if (!tieneFormatoValido(token) || !RegistroEstudianteDTO.esPasswordSegura(nuevaPassword)) return false;
        String numControl = repository.bloquearTokenValido(hash(token));
        if (numControl == null) return false;
        repository.cambiarPassword(numControl, passwordEncoder.encode(nuevaPassword));
        return true;
    }

    private boolean tieneFormatoValido(String token) {
        return token != null && token.matches("[A-Za-z0-9_-]{43}");
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("No se puede calcular SHA-256", exception);
        }
    }
}
