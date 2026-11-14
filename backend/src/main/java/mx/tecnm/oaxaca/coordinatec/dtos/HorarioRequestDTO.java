package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalTime;
import java.util.List;

public record HorarioRequestDTO(
    @NotNull @Min(1) @Max(7) Integer diaSemana,
    @NotNull LocalTime horaInicio,
    @NotNull LocalTime horaSalida,
    @NotEmpty List<@NotNull Long> tramiteIds
) {}
