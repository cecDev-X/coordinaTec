package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitarRecuperacionDTO(@NotBlank @Email @Size(max = 254) String correo) {}
