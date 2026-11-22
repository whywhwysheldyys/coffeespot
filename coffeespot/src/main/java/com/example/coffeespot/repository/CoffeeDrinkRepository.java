package com.example.coffeespot.repository;

import com.example.coffeespot.entity.CoffeeDrinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoffeeDrinkRepository extends JpaRepository<CoffeeDrinkEntity, Long> {
}
