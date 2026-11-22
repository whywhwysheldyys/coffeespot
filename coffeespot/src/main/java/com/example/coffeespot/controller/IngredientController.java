package com.example.coffeespot.controller;

import com.example.coffeespot.entity.IngredientEntity;
import com.example.coffeespot.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public List<IngredientEntity> getAllIngredients() {
        return ingredientService.getAllIngredients();
    }

    @PostMapping
    public IngredientEntity createIngredient(@RequestBody IngredientEntity ingredient) {
        return ingredientService.saveIngredient(ingredient);
    }

    @DeleteMapping("/{id}")
    public void deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredientIfOutOfStock(id);
    }
}