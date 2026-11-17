package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CorsProductionTests {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    @Autowired JwtService jwt;

    @Test
    @Transactional
    void adminCanLogInAndUseProtectedApiFromProductionOrigin() throws Exception {
        String username = "cors-" + UUID.randomUUID();
        String origin = "https://admin.coordinatec.site";
        jdbc.update("INSERT INTO jefe_coordinadores (username, nombre_completo, password_hash) VALUES (?, ?, ?)",
            username, "Jefatura de prueba", passwords.encode("ClaveDePrueba123!"));

        mvc.perform(post("/api/v1/auth/login")
                .header("Origin", origin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"ClaveDePrueba123!\"}"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", origin))
            .andExpect(jsonPath("$.token").isNotEmpty());

        mvc.perform(get("/api/v1/auth/me")
                .header("Origin", origin)
                .header("Authorization", "Bearer " + jwt.issue(username, "JEFE_COORDINADORES")))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", origin))
            .andExpect(jsonPath("$.username").value(username));
    }

    @Test
    void adminLoginFromProductionOriginReachesAuthentication() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                .header("Origin", "https://admin.coordinatec.site")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"nonexistent-user\",\"password\":\"incorrecta\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("Access-Control-Allow-Origin", "https://admin.coordinatec.site"));
    }

    @Test
    void studentOriginCanReachPublicEndpoint() throws Exception {
        mvc.perform(get("/api/v1/estudiantes/carreras")
                .header("Origin", "https://coordinatec.site"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "https://coordinatec.site"));
    }

    @Test
    void preflightAllowsPortalRequestsWithAuthHeaders() throws Exception {
        for (String origin : new String[]{"https://coordinatec.site", "https://admin.coordinatec.site", "http://localhost:5173"}) {
            for (String method : new String[]{"GET", "POST", "PUT", "PATCH", "DELETE"}) {
                mvc.perform(options("/api/v1/tramites/1")
                        .header("Origin", origin)
                        .header("Access-Control-Request-Method", method)
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin))
                    .andExpect(header().exists("Access-Control-Allow-Headers"));
            }
        }
    }

    @Test
    void rejectsUnknownOrigins() throws Exception {
        mvc.perform(options("/api/v1/auth/login")
                .header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST"))
            .andExpect(status().isForbidden())
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
