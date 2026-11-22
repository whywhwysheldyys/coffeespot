package com.example.coffeespot.controller;

import com.example.coffeespot.entity.DrinkRecipeEntity;
import com.example.coffeespot.service.DrinkRecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recipes")
public class DrinkRecipeController {

    private final DrinkRecipeService drinkRecipeService;

    public record RecipeItemResponse(
            Long id,
            Long drinkId,
            Long ingredientId,
            String ingredientName,
            String unit,
            BigDecimal quantityNeeded
    ) {}

    public record AddRecipeItemRequest(
            Long drinkId,
            Long ingredientId,
            BigDecimal quantityNeeded
    ) {}

    @GetMapping("/drink/{drinkId}")
    public List<RecipeItemResponse> getRecipeByDrink(@PathVariable Long drinkId) {
        return drinkRecipeService.getRecipeByDrinkId(drinkId).stream()
                .map(item -> new RecipeItemResponse(
                        item.getId(),
                        item.getDrink().getId(),
                        item.getIngredient().getId(),
                        item.getIngredient().getName(),
                        item.getIngredient().getUnit(),
                        item.getQuantityNeeded()
                ))
                .toList();
    }

    @PostMapping
    public RecipeItemResponse addIngredient(@RequestBody AddRecipeItemRequest req) {
        DrinkRecipeEntity saved = drinkRecipeService.addIngredientToRecipe(
                req.drinkId(),
                req.ingredientId(),
                req.quantityNeeded()
        );
        return new RecipeItemResponse(
                saved.getId(),
                saved.getDrink().getId(),
                saved.getIngredient().getId(),
                saved.getIngredient().getName(),
                saved.getIngredient().getUnit(),
                saved.getQuantityNeeded()
        );
    }

    @DeleteMapping("/{id}")
    public void removeFromRecipe(@PathVariable Long id) {
        drinkRecipeService.removeIngredientFromRecipe(id);
    }
}