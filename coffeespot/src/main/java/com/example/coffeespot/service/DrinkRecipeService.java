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
public class DrinkRecipeService {

    private final DrinkRecipeRepository drinkRecipeRepository;
    private final CoffeeDrinkRepository coffeeDrinkRepository;
    private final IngredientRepository ingredientRepository;

    @Transactional
    public DrinkRecipeEntity addIngredientToRecipe(Long drinkId, Long ingredientId, BigDecimal quantityNeeded) {
        CoffeeDrinkEntity drink = coffeeDrinkRepository.findById(drinkId)
                .orElseThrow(() -> new IllegalArgumentException("Напиток не найден: " + drinkId));

        IngredientEntity ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new IllegalArgumentException("Ингредиент не найден: " + ingredientId));

        DrinkRecipeEntity recipe = new DrinkRecipeEntity();
        recipe.setDrink(drink);
        recipe.setIngredient(ingredient);
        recipe.setQuantityNeeded(quantityNeeded);

        return drinkRecipeRepository.save(recipe);
    }

    public List<DrinkRecipeEntity> getRecipeByDrinkId(Long drinkId) {
        return drinkRecipeRepository.findByDrinkId(drinkId);
    }

    @Transactional
    public void removeIngredientFromRecipe(Long recipeId) {
        if (!drinkRecipeRepository.existsById(recipeId)) {
            throw new IllegalArgumentException("Позиция рецепта не найдена: " + recipeId);
        }
        drinkRecipeRepository.deleteById(recipeId);
    }
}