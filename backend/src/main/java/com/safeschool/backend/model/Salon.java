package com.safeschool.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "salon")
@Getter
@Setter
public class Salon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "colegio_id")
    private Colegio colegio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "docente_id")
    private Usuario docente;

    @Column(nullable = false, length = 30)
    private String nombre;

    @Column(length = 30)
    private String grado;
}
