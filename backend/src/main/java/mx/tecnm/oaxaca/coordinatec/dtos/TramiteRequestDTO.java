package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TramiteRequestDTO(
    @NotBlank @Size(max = 150) String nombre,
    @Min(1) @Max(365) int periodo,
    @Min(5) @Max(480) int duracionMinutos,
    @NotNull String requisitos,
    @NotNull Boolean activo,
    @NotBlank @Pattern(regexp = "ALTA|MEDIA|BAJA") String prioridad
) {}
