package mx.tecnm.oaxaca.coordinatec;

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

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PasswordResetCoordinacionTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder encoder;
    @MockitoBean WelcomeEmailService email;

    @Test
    void coordinadorRecuperaConUsuarioYCorreoYElEnlaceEsDeUnSoloUso() throws Exception {
        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        String username = "RFC" + unique;
        String correo = "coord-" + unique + "@ejemplo.com";
        Integer departmentId = jdbc.queryForObject(
            "INSERT INTO departamento (nombre_area) VALUES (?) RETURNING id", Integer.class, "Prueba " + unique);
        try {
            jdbc.update("""
                INSERT INTO coordinador (rfc, username, nombre_completo, password_hash, departamento_id, correo_recuperacion)
                VALUES (?, ?, 'Coordinadora Prueba', ?, ?, ?)
                """, username, username, encoder.encode("Anterior123!"), departmentId, correo);
            when(email.disponible()).thenReturn(true);

            mvc.perform(post("/api/v1/auth/recuperacion-coordinacion/solicitar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"username":"%s","correo":"%s"}
                        """.formatted(username, correo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Si los datos corresponden a una cuenta con correo de recuperación, recibirás un enlace para cambiar la contraseña."));

            org.mockito.ArgumentCaptor<String> token = org.mockito.ArgumentCaptor.forClass(String.class);
            verify(email).enviarRecuperacionCoordinacion(eq("Coordinadora Prueba"), eq(correo), eq(username), token.capture());

            mvc.perform(post("/api/v1/auth/recuperacion-coordinacion/confirmar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"token":"%s","password":"NuevaClave456!"}
                        """.formatted(token.getValue())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Contraseña actualizada. Ya puedes iniciar sesión."));
            String newHash = jdbc.queryForObject("SELECT password_hash FROM coordinador WHERE username = ?", String.class, username);
            assertThat(encoder.matches("NuevaClave456!", newHash)).isTrue();

            mvc.perform(post("/api/v1/auth/recuperacion-coordinacion/confirmar")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"token":"%s","password":"OtraClave789!"}
                        """.formatted(token.getValue())))
                .andExpect(status().isBadRequest());
        } finally {
            jdbc.update("DELETE FROM cuenta_coordinacion_password_reset WHERE username = ?", username);
            jdbc.update("DELETE FROM coordinador WHERE username = ?", username);
            jdbc.update("DELETE FROM departamento WHERE id = ?", departmentId);
        }
    }
}
