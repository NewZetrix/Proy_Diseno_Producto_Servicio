package com.safeschool.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table (name = "colegio")
@Getter 
@Setter 
public class Colegio {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column (nullable = false,length = 120)
    private String nombre;

    @Column (length = 120)
    private String direccion;
}
