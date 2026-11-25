package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SolicitarVerificacionCorreoDTO(
    @NotBlank @Pattern(regexp = "(?:[0-9]{8}|C[0-9]{8})") String numControl,
    @NotBlank @Email @Size(max = 254) String correo
) {}
