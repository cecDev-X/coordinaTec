package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CrearCoordinadorDTO(
    @NotBlank @Size(max = 13) String rfc,
    @NotBlank @Size(max = 150) String nombreCompleto,
    @NotBlank @Size(min = 8, max = 72) String password,
    @NotEmpty List<@NotBlank @Size(max = 100) String> carreras
) {}
