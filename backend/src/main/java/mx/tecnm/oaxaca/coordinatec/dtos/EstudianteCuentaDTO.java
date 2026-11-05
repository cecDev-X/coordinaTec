package mx.tecnm.oaxaca.coordinatec.dtos;

public record EstudianteCuentaDTO(
    String numControl,
    String nombres,
    String apellidos,
    String carrera,
    String passwordHash
) {}
