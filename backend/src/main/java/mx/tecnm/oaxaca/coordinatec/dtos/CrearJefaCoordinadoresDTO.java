package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearJefaCoordinadoresDTO(
    @NotBlank @Size(max = 120) String username,
    @NotBlank @Size(max = 150) String nombreCompleto,
    @NotBlank @Size(min = 8, max = 72) String password
) {}
