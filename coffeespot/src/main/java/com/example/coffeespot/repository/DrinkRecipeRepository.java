package com.example.coffeespot.repository;

import com.example.coffeespot.entity.DrinkRecipeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DrinkRecipeRepository extends JpaRepository<DrinkRecipeEntity, Long> {
    List<DrinkRecipeEntity> findByDrinkId(Long drinkId);
}
