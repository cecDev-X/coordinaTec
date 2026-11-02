package mx.tecnm.oaxaca.coordinatec.dtos;

import java.time.LocalDate;
import java.time.LocalTime;

public record CitaResumenDTO(
    String folio,
    String numControl,
    String nombre,
    String carrera,
    String tramite,
    LocalDate fecha,
    LocalTime horaInicio,
    String estado
) {}
