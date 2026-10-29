package mx.tecnm.oaxaca.coordinatec.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "cita")
public class CitaEntity {

    @Id
    @Column(name = "folio", length = 50)
    private String folio;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "estudiante_numerocontrol", nullable = false, length = 15)
    private String numControlEstudiante;

    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "motivo", columnDefinition = "text")
    private String motivo;

    @Column(name = "estado", length = 20)
    private String estado; // "PROGRAMADA", "ATENDIDA", etc.

    @Column(name = "coordinador_rfc", nullable = false, length = 13)
    private String coordinadorRfc;

    @Column(name = "formato_folio", nullable = false, length = 50)
    private String formatoFolio;

    // Constructores, Getters y Setters
    public CitaEntity() {}

    public String getFolio() { return folio; }
    public void setFolio(String folio) { this.folio = folio; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }

    public String getNumControlEstudiante() { return numControlEstudiante; }
    public void setNumControlEstudiante(String numControlEstudiante) { this.numControlEstudiante = numControlEstudiante; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCoordinadorRfc() { return coordinadorRfc; }
    public void setCoordinadorRfc(String coordinadorRfc) { this.coordinadorRfc = coordinadorRfc; }

    public String getFormatoFolio() { return formatoFolio; }
    public void setFormatoFolio(String formatoFolio) { this.formatoFolio = formatoFolio; }
}
