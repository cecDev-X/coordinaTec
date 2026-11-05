package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record InicioSesionEstudianteDTO(
    @NotBlank @Pattern(regexp = "[A-Za-z0-9]{1,15}") String numControl,
    @NotBlank String password
) {}
