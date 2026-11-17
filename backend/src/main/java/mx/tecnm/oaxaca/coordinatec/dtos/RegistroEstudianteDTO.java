package mx.tecnm.oaxaca.coordinatec.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistroEstudianteDTO(
    @NotBlank @Pattern(regexp = "(?:[0-9]{8}|C[0-9]{8})") String numControl,
    @NotBlank @Size(max = 100) @Pattern(regexp = "[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*") String nombres,
    @NotBlank @Size(max = 100) @Pattern(regexp = "[\\p{L}\\p{M}]+(?: [\\p{L}\\p{M}]+)*") String apellidos,
    @NotBlank @Size(max = 100) String carrera,
    @NotBlank @Email @Size(max = 254) String correo,
    @NotBlank @Size(min = 8, max = 72) String password
) {
    public static boolean esPasswordSegura(String password) {
        return password != null && password.length() >= 8 && password.length() <= 72
            && password.matches("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s])[^\\r\\n]+");
    }
}
