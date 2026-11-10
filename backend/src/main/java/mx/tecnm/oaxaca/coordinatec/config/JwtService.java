package mx.tecnm.oaxaca.coordinatec.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@Component
public class JwtService {
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private final ObjectMapper mapper = new ObjectMapper();
    private final byte[] secret;

    public JwtService(@Value("${coordinatec.auth.jwt-secret}") String secret) {
        if (secret.isBlank()) {
            this.secret = new byte[32];
            new SecureRandom().nextBytes(this.secret);
        } else {
            this.secret = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (this.secret.length < 32) throw new IllegalArgumentException("JWT secret must contain at least 32 bytes");
    }

    public String issue(String username, String role) {
        try {
            String header = ENCODER.encodeToString(mapper.writeValueAsBytes(Map.of("alg", "HS256", "typ", "JWT")));
            String payload = ENCODER.encodeToString(mapper.writeValueAsBytes(Map.of(
                "sub", username, "role", role, "iat", Instant.now().getEpochSecond(),
                "exp", Instant.now().plusSeconds(8 * 60 * 60).getEpochSecond()
            )));
            String data = header + "." + payload;
            return data + "." + ENCODER.encodeToString(sign(data));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not issue access token", exception);
        }
    }

    public Claims verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !java.security.MessageDigest.isEqual(sign(parts[0] + "." + parts[1]), DECODER.decode(parts[2]))) return null;
            Map<?, ?> payload = mapper.readValue(DECODER.decode(parts[1]), Map.class);
            long expiry = ((Number) payload.get("exp")).longValue();
            String username = (String) payload.get("sub");
            String role = (String) payload.get("role");
            if (Instant.now().getEpochSecond() >= expiry || username == null || !roleMatches(role)) return null;
            return new Claims(username, role);
        } catch (Exception exception) {
            return null;
        }
    }

    private byte[] sign(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private boolean roleMatches(String role) {
        return "JEFE_COORDINADORES".equals(role) || "COORDINADOR".equals(role) || "ESTUDIANTE".equals(role);
    }

    public record Claims(String username, String role) {}
}
