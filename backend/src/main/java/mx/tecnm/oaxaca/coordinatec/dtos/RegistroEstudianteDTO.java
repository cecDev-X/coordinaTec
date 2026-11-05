package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroEstudianteDTO(
    @NotBlank @Pattern(regexp = "[A-Za-z0-9]{1,15}") String numControl,
    @NotBlank @Size(max = 100) String nombres,
    @NotBlank @Size(max = 100) String apellidos,
    @NotBlank @Size(max = 100) String carrera,
    @NotBlank @Size(min = 8, max = 72) String password
) {}
