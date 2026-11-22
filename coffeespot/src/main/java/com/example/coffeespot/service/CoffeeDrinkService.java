package com.example.coffeespot.service;

import com.example.coffeespot.entity.CoffeeDrinkEntity;
import com.example.coffeespot.entity.DrinkRecipeEntity;
import com.example.coffeespot.entity.IngredientEntity;
import com.example.coffeespot.repository.CoffeeDrinkRepository;
import com.example.coffeespot.repository.DrinkRecipeRepository;
import com.example.coffeespot.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoffeeDrinkService {

    private final CoffeeDrinkRepository coffeeDrinkRepository;
    private final DrinkRecipeRepository drinkRecipeRepository;
    private final IngredientRepository ingredientRepository;

    public List<CoffeeDrinkEntity> getAllDrinks() {
        return coffeeDrinkRepository.findAll();
    }

    public CoffeeDrinkEntity saveDrink(CoffeeDrinkEntity drink) {
        return coffeeDrinkRepository.save(drink);
    }

    @Transactional
    public CoffeeDrinkEntity sellDrink(Long drinkId) {
        CoffeeDrinkEntity drink = coffeeDrinkRepository.findById(drinkId)
                .orElseThrow(() -> new IllegalArgumentException("Напиток не найден: " + drinkId));

        List<DrinkRecipeEntity> recipeItems = drinkRecipeRepository.findByDrinkId(drinkId);

        for (DrinkRecipeEntity item : recipeItems) {
            IngredientEntity ingredient = ingredientRepository.findById(item.getIngredient().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Ингредиент не найден"));

            BigDecimal currentStock = ingredient.getStockQuantity();
            BigDecimal needed = item.getQuantityNeeded();

            if (currentStock.compareTo(needed) < 0) {
                throw new IllegalStateException("Недостаточно ингредиента: " + ingredient.getName());
            }

            ingredient.setStockQuantity(currentStock.subtract(needed));
            ingredientRepository.save(ingredient);
        }

        return drink;
    }
}