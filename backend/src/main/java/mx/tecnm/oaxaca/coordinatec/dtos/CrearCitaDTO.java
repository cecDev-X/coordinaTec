package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;

import java.time.LocalDate;
import java.time.LocalTime;

public record CrearCitaDTO(
    @NotNull @FutureOrPresent LocalDate fecha,
    @NotNull LocalTime horaInicio,
    String motivo,
    @NotBlank String coordinadorRfc,
    @NotBlank String numControlEstudiante,
    @NotBlank String formatoFolio
) {}
