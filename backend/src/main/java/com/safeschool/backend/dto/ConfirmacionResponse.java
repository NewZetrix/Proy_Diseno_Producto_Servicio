package com.safeschool.backend.dto;

public class ConfirmacionResponse {
    private Long id;
    private Long salonId;
    private String nombreSalon;
    private String estado;
    private String fechaHoraConfirmacion;
    private long salonesConfirmados;
    private long totalSalones;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSalonId() { return salonId; }
    public void setSalonId(Long salonId) { this.salonId = salonId; }

    public String getNombreSalon() { return nombreSalon; }
    public void setNombreSalon(String nombreSalon) { this.nombreSalon = nombreSalon; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getFechaHoraConfirmacion() { return fechaHoraConfirmacion; }
    public void setFechaHoraConfirmacion(String fechaHoraConfirmacion) { this.fechaHoraConfirmacion = fechaHoraConfirmacion; }

    public long getSalonesConfirmados() { return salonesConfirmados; }
    public void setSalonesConfirmados(long salonesConfirmados) { this.salonesConfirmados = salonesConfirmados; }

    public long getTotalSalones() { return totalSalones; }
    public void setTotalSalones(long totalSalones) { this.totalSalones = totalSalones; }
}