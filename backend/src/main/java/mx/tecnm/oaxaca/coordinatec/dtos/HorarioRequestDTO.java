package mx.tecnm.oaxaca.coordinatec.dtos;

public class HorarioRequestDTO {
    private int dia_semana;
    private String hora_inicio;
    private String hora_salida;
    private int duracion;

    // Getters y Setters
    public int getDia_semana() { return dia_semana; }
    public void setDia_semana(int dia_semana) { this.dia_semana = dia_semana; }
    public String getHora_inicio() { return hora_inicio; }
    public void setHora_inicio(String hora_inicio) { this.hora_inicio = hora_inicio; }
    public String getHora_salida() { return hora_salida; }
    public void setHora_salida(String hora_salida) { this.hora_salida = hora_salida; }
    public int getDuracion() { return duracion; }
    public void setDuracion(int duracion) { this.duracion = duracion; }
}