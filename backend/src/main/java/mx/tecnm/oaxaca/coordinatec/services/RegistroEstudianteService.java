package mx.tecnm.oaxaca.coordinatec.services;

import mx.tecnm.oaxaca.coordinatec.dtos.RegistroEstudianteDTO;
import mx.tecnm.oaxaca.coordinatec.repositories.EstudianteAuthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistroEstudianteService {
    private final EstudianteAuthRepository estudiantes;
    private final VerificacionCorreoService verificacion;

    public RegistroEstudianteService(EstudianteAuthRepository estudiantes, VerificacionCorreoService verificacion) {
        this.estudiantes = estudiantes;
        this.verificacion = verificacion;
    }

    @Transactional
    public ConfirmacionPendiente registrar(RegistroEstudianteDTO request, String passwordHash) {
        estudiantes.registrar(request, passwordHash);
        String token = verificacion.crearToken(request.numControl().trim());
        return new ConfirmacionPendiente(request.numControl().trim(), request.nombres().trim(),
            request.correo().trim().toLowerCase(java.util.Locale.ROOT), token);
    }

    public record ConfirmacionPendiente(String numControl, String nombres, String correo, String token) {}
}
