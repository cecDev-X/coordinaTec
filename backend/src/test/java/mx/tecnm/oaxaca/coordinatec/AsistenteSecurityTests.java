package mx.tecnm.oaxaca.coordinatec;

import mx.tecnm.oaxaca.coordinatec.config.JwtService;
import mx.tecnm.oaxaca.coordinatec.services.AsistenteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AsistenteSecurityTests {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @MockitoBean AsistenteService service;

    @Test
    void soloEstudiantePuedeConsultarYSeValidanLosMensajes() throws Exception {
        String url = "/api/v1/asistente/consultar";
        mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content("{\"mensaje\":\"Hola\"}"))
            .andExpect(status().isForbidden());
        mvc.perform(post(url).header("Authorization", "Bearer " + jwt.issue("COORD", "COORDINADOR"))
            .contentType(MediaType.APPLICATION_JSON).content("{\"mensaje\":\"Hola\"}"))
            .andExpect(status().isForbidden());
        String auth = "Bearer " + jwt.issue("23160887", "ESTUDIANTE");
        mvc.perform(post(url).header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"mensaje\":\"  \"}"))
            .andExpect(status().isBadRequest());
        mvc.perform(post(url).header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"mensaje\":\"Hola\",\"historial\":[{\"pregunta\":\"\",\"respuesta\":\"texto\"}]}"))
            .andExpect(status().isBadRequest());
        when(service.consultar(eq("23160887"), any())).thenAnswer(invocation -> org.springframework.http.ResponseEntity.ok(Map.of("respuesta", "Hola")));
        mvc.perform(post(url).header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
            .content("{\"mensaje\":\"Hola\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.respuesta").value("Hola"));
        verify(service).consultar(eq("23160887"), any());
    }
}
