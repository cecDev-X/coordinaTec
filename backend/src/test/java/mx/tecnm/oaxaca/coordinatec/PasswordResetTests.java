package mx.tecnm.oaxaca.coordinatec;

import com.fasterxml.jackson.databind.ObjectMapper;
import mx.tecnm.oaxaca.coordinatec.notifications.WelcomeEmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PasswordResetTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @MockitoBean WelcomeEmailService mail;

    private String json(Map<String, String> data) throws Exception {
        return new ObjectMapper().writeValueAsString(data);
    }

    @Test
    @Transactional
    void solicitudNoRevelaLaCuentaYElEnlaceEsUnicoYExpira() throws Exception {
        String control = "C" + String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits() % 100000000));
        String email = "reset-" + UUID.randomUUID() + "@ejemplo.com";
        jdbc.update("""
            INSERT INTO estudiante (numerocontrol, nombres, apellidos, carrera, correo, password_hash)
            VALUES (?, 'Ana', 'Prueba', 'Ingeniería en Sistemas Computacionales', ?, ?)
            """, control, email, passwords.encode("Anterior123!"));
        when(mail.disponible()).thenReturn(false);
        mvc.perform(post("/api/v1/estudiantes/recuperacion/solicitar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("correo", email))))
            .andExpect(status().isServiceUnavailable());
        when(mail.disponible()).thenReturn(true);
        when(mail.enviarRecuperacion(anyString(), anyString(), anyString(), anyString())).thenReturn(true);

        mvc.perform(post("/api/v1/estudiantes/recuperacion/solicitar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("correo", "no-existe@ejemplo.com"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.mensaje").value(
                "Si hay una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña."));
        verify(mail, never()).enviarRecuperacion(anyString(), anyString(), anyString(), anyString());

        mvc.perform(post("/api/v1/estudiantes/recuperacion/solicitar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("correo", email))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.mensaje").value(
                "Si hay una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña."));
        org.mockito.ArgumentCaptor<String> tokenCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(mail).enviarRecuperacion(eq("Ana"), eq(email), eq(control), tokenCaptor.capture());
        String token = tokenCaptor.getValue();
        assertThat(token).hasSize(43);
        assertThat(jdbc.queryForObject("SELECT token_hash FROM estudiante_password_reset WHERE numerocontrol = ?", String.class, control))
            .isNotEqualTo(token);

        mvc.perform(post("/api/v1/estudiantes/recuperacion/solicitar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("correo", email))))
            .andExpect(status().isOk());
        verify(mail, times(1)).enviarRecuperacion(anyString(), anyString(), anyString(), anyString());

        jdbc.update("UPDATE estudiante_password_reset SET vence_en = CURRENT_TIMESTAMP - INTERVAL '1 minute' WHERE numerocontrol = ?", control);
        mvc.perform(post("/api/v1/estudiantes/recuperacion/validar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.valido").value(false));
        jdbc.update("UPDATE estudiante_password_reset SET vence_en = CURRENT_TIMESTAMP + INTERVAL '30 minutes' WHERE numerocontrol = ?", control);

        mvc.perform(post("/api/v1/estudiantes/recuperacion/validar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.valido").value(true));
        mvc.perform(post("/api/v1/estudiantes/recuperacion/confirmar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token, "password", "no-es-segura"))))
            .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/estudiantes/recuperacion/confirmar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token, "password", "Segura123!"))))
            .andExpect(status().isOk());
        mvc.perform(post("/api/v1/estudiantes/recuperacion/confirmar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token, "password", "Segura456!"))))
            .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/estudiantes/recuperacion/validar").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("token", token))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.valido").value(false));
        assertThat(jdbc.queryForObject("SELECT password_hash FROM estudiante WHERE numerocontrol = ?", String.class, control))
            .satisfies(hash -> {
                assertThat(passwords.matches("Anterior123!", hash)).isFalse();
                assertThat(passwords.matches("Segura123!", hash)).isTrue();
            });
        mvc.perform(post("/api/v1/estudiantes/sesion").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("numControl", control, "password", "Anterior123!"))))
            .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/estudiantes/sesion").contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("numControl", control, "password", "Segura123!"))))
            .andExpect(status().isOk());
    }
}
