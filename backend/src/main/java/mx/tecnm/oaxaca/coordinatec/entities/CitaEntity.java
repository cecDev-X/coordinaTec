package mx.tecnm.oaxaca.coordinatec.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "citas")
public class CitaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String folio;

    @Column(nullable = false)
    private String numControlEstudiante;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalTime horaInicio;

    private String motivo;

    @Column(nullable = false)
    private String estado; // "PROGRAMADA", "ATENDIDA", etc.

    // Constructores, Getters y Setters
    public CitaEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFolio() { return folio; }
    public void setFolio(String folio) { this.folio = folio; }

    public String getNumControlEstudiante() { return numControlEstudiante; }
    public void setNumControlEstudiante(String numControlEstudiante) { this.numControlEstudiante = numControlEstudiante; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}