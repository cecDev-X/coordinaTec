package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmarCorreoDTO(@NotBlank @Size(max = 128) String token) {}
