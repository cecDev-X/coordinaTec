package mx.tecnm.oaxaca.coordinatec.dtos;

import java.util.List;

public record FormatoOpcionDTO(String folio, String asunto, String tipoTramite, Integer duracionMinutos, List<String> carrerasHabilitadas) {}
