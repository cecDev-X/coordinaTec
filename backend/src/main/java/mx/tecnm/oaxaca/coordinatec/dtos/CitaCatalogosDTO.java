package mx.tecnm.oaxaca.coordinatec.dtos;

import java.util.List;

public record CitaCatalogosDTO(
    List<EstudianteOpcionDTO> estudiantes,
    List<CoordinadorOpcionDTO> coordinadores,
    List<FormatoOpcionDTO> formatos
) {}
