package com.safeschool.backend.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "estudiante")
@Getter
@Setter
public class Estudiante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salon_id")
    private Salon salon;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "apoderado_id")
    private Usuario apoderado;

    @Column(nullable = false, length = 100)
    private String nombre;
}
