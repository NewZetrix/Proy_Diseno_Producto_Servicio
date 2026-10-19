package com.safeschool.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergencia")
@Getter
@Setter
public class Emergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "colegio_id")
    private Colegio colegio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activada_por")
    private Usuario activadaPor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEmergencia tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEmergencia estado = EstadoEmergencia.ACTIVA;

    @Column(name = "activada_en", nullable = false)
    private LocalDateTime activadaEn = LocalDateTime.now();

    @Column(name = "finalizada_en")
    private LocalDateTime finalizadaEn;
}
