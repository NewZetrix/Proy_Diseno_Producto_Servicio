package com.safeschool.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "confirmacion_salon")
@Getter
@Setter
public class ConfirmacionSalon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "emergencia_id")
    private Emergencia emergencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salon_id")
    private Salon salon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmado_por")
    private Usuario confirmadoPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoConfirmacion estado = EstadoConfirmacion.PENDIENTE;

    @Column(name = "confirmado_en")
    private LocalDateTime confirmadoEn;
}