package mx.tecnm.oaxaca.coordinatec.services;

import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.notifications.WelcomeEmailService;
import mx.tecnm.oaxaca.coordinatec.repositories.PasswordResetCoordinacionRepository;
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
public class PasswordResetCoordinacionService {
    private final PasswordResetCoordinacionRepository repository;
    private final WelcomeEmailService email;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public PasswordResetCoordinacionService(PasswordResetCoordinacionRepository repository,
                                            WelcomeEmailService email,
                                            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.email = email;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean disponible() { return email.disponible(); }

    public void solicitar(String username, String correo) {
        repository.buscarCuenta(username, correo).ifPresent(account -> {
            byte[] bytes = new byte[32];
            random.nextBytes(bytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            if (repository.guardarToken(account.username(), account.rol(), hash(token))) {
                email.enviarRecuperacionCoordinacion(account.nombre(), account.correo(), account.username(), token);
            }
        });
    }

    public boolean esValido(String token) {
        return tieneFormatoValido(token) && repository.tokenValido(hash(token));
    }

    @Transactional
    public boolean restablecer(String token, String nuevaPassword) {
        if (!tieneFormatoValido(token) || !RegistroEstudianteDTO.esPasswordSegura(nuevaPassword)) return false;
        String account = repository.bloquearTokenValido(hash(token));
        if (account == null) return false;
        String[] values = account.split("\\|", 2);
        repository.cambiarPassword(values[0], values[1], passwordEncoder.encode(nuevaPassword));
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
