package mx.tecnm.oaxaca.coordinatec.services;

import mx.tecnm.oaxaca.coordinatec.entities.CitaEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

    private static final String DOMINIO_ESTUDIANTIL = "@itoaxaca.edu.mx";

    private final JavaMailSender mailSender;
    private final String remitente;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mail.from:}") String remitente) {
        this.mailSender = mailSender;
        this.remitente = remitente;
    }

    public void enviarConfirmacionCita(CitaEntity cita) {
        enviarCorreoCita(cita, "Confirmación de cita", "Tu cita ha sido programada.");
    }

    public void enviarCancelacionCita(CitaEntity cita) {
        enviarCorreoCita(cita, "Cancelación de cita", "Tu cita ha sido cancelada.");
    }

    public void enviarRecordatorioCita(CitaEntity cita) {
        enviarCorreoCita(cita, "Recordatorio de cita", "Te recordamos que tienes una cita programada.");
    }

    public String correoInstitucional(String numeroControl) {
        if (!StringUtils.hasText(numeroControl)) {
            throw new IllegalArgumentException("El número de control es obligatorio para generar el correo.");
        }
        String control = numeroControl.trim();
        if (!control.matches("[0-9]{2}16[0-9]{4}")) {
            throw new IllegalArgumentException("El número de control debe tener 8 dígitos y el plantel 16 en las posiciones 3 y 4.");
        }
        return control + DOMINIO_ESTUDIANTIL;
    }

    private void enviarCorreoCita(CitaEntity cita, String asunto, String introduccion) {
        if (cita == null) {
            throw new IllegalArgumentException("La cita es obligatoria.");
        }
        if (!StringUtils.hasText(remitente)) {
            throw new IllegalStateException("Configura SMTP_FROM o SMTP_USERNAME antes de enviar correos.");
        }

        String destinatario = correoInstitucional(cita.getNumControlEstudiante());
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(remitente);
        mensaje.setTo(destinatario);
        mensaje.setSubject(asunto);
        mensaje.setText(introduccion + "\n\n"
                + "Folio: " + valor(cita.getFolio()) + "\n"
                + "Fecha: " + valor(cita.getFecha()) + "\n"
                + "Hora: " + valor(cita.getHoraInicio()) + "\n"
                + "Motivo: " + valor(cita.getMotivo()));
        mailSender.send(mensaje);
    }

    private String valor(Object valor) {
        return valor == null ? "No especificado" : valor.toString();
    }
}
