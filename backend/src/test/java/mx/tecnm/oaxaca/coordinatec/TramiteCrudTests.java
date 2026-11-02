package mx.tecnm.oaxaca.coordinatec;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TramiteCrudTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    @Transactional
    void permiteCrearListarActualizarActivarYEliminarTiposDeTramite() throws Exception {
        assertThat(jdbc.queryForObject(
            "SELECT count(*) FROM flyway_schema_history WHERE version IN ('3', '4') AND success", Integer.class
        )).isEqualTo(2);

        String nombre = "Trámite de prueba " + UUID.randomUUID();
        String crear = """
            {"nombre":"%s","periodo":3,"duracionMinutos":25,"requisitos":"Solicitud firmada","activo":true,"prioridad":"MEDIA"}
            """.formatted(nombre);

        mvc.perform(post("/api/v1/tramites")
                .contentType(MediaType.APPLICATION_JSON).content(crear))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nombre").value(nombre))
            .andExpect(jsonPath("$.periodo").value(3))
            .andExpect(jsonPath("$.duracionMinutos").value(25))
            .andExpect(jsonPath("$.activo").value(true));

        Long id = jdbc.queryForObject("SELECT id FROM tramite WHERE nombre = ?", Long.class, nombre);
        String folioFormato = "FMT-TRAMITE-" + UUID.randomUUID();
        jdbc.update("INSERT INTO formato (folio, asunto, tipo_tramite, tramite_id) VALUES (?, ?, ?, ?)",
            folioFormato, "Formato de prueba", nombre, id);

        mvc.perform(get("/api/v1/tramites")).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM tramite WHERE id = ?", Integer.class, id)).isEqualTo(1);
        mvc.perform(get("/api/v1/tramites/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.prioridad").value("MEDIA"));

        mvc.perform(put("/api/v1/tramites/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nombre":"%s","periodo":5,"duracionMinutos":40,"requisitos":"Kardex","activo":false,"prioridad":"ALTA"}
                    """.formatted(nombre)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.periodo").value(5))
            .andExpect(jsonPath("$.duracionMinutos").value(40))
            .andExpect(jsonPath("$.activo").value(false))
            .andExpect(jsonPath("$.prioridad").value("ALTA"));

        mvc.perform(put("/api/v1/tramites/{id}", 999999L)
                .contentType(MediaType.APPLICATION_JSON).content(crear))
            .andExpect(status().isNotFound());
        mvc.perform(post("/api/v1/tramites")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Invalido\",\"periodo\":0,\"duracionMinutos\":20,\"requisitos\":\"\",\"activo\":true,\"prioridad\":\"URGENTE\"}"))
            .andExpect(status().isBadRequest());
        mvc.perform(delete("/api/v1/tramites/{id}", id)).andExpect(status().isConflict());
        jdbc.update("DELETE FROM formato WHERE folio = ?", folioFormato);
        mvc.perform(delete("/api/v1/tramites/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/tramites/{id}", id)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/tramites/{id}", id)).andExpect(status().isNotFound());
    }
}
