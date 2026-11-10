package mx.tecnm.oaxaca.coordinatec.dtos;

import java.util.List;

public record CoordinadorOpcionDTO(String rfc, String nombre, String departamento, List<String> carreras) {}
