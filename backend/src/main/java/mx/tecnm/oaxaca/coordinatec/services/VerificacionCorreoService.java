package mx.tecnm.oaxaca.coordinatec.services;

import mx.tecnm.oaxaca.coordinatec.repositories.EstudianteAuthRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.VerificacionCorreoRepository;
import mx.tecnm.oaxaca.coordinatec.repositories.VerificacionCorreoRepository.Cuenta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class VerificacionCorreoService {
    private final EstudianteAuthRepository estudiantes;
    private final VerificacionCorreoRepository verificaciones;
    private final SecureRandom random = new SecureRandom();

    public VerificacionCorreoService(EstudianteAuthRepository estudiantes, VerificacionCorreoRepository verificaciones) {
        this.estudiantes = estudiantes;
        this.verificaciones = verificaciones;
    }

    @Transactional
    public String crearToken(String numControl) {
        return crearYGuardar(numControl);
    }

    @Transactional
    public Optional<String> reenviar(String numControl, String correo) {
        Optional<Cuenta> cuenta = verificaciones.buscarCuentaSinVerificar(numControl.trim(), correo.trim());
        if (cuenta.isEmpty()) return Optional.empty();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        return verificaciones.guardarTokenReenvio(numControl.trim(), correo.trim(), hash(token))
            ? Optional.of(token) : Optional.empty();
    }

    @Transactional
    public boolean confirmar(String token) {
        return tieneFormatoValido(token) && verificaciones.confirmar(hash(token));
    }

    private String crearYGuardar(String numControl) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        verificaciones.guardarToken(numControl, hash(token));
        return token;
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
