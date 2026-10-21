package mx.tecnm.oaxaca.coordinatec.dtos;


public class CitaRequestDTO {
    private String coordinador_rfc;
    private String fecha;
    private String hora_inicio;
    private String motivo;

    // Getters y Setters
    public String getCoordinador_rfc() { return coordinador_rfc; }
    public void setCoordinador_rfc(String coordinador_rfc) { this.coordinador_rfc = coordinador_rfc; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getHora_inicio() { return hora_inicio; }
    public void setHora_inicio(String hora_inicio) { this.hora_inicio = hora_inicio; }
    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
