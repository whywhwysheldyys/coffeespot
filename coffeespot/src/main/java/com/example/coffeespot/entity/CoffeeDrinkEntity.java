package com.example.coffeespot.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "coffee_drinks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CoffeeDrinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "volume_ml", nullable = false)
    private Integer volumeMl;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String category;

}
