package com.example.coffeespot.service;

import com.example.coffeespot.entity.IngredientEntity;
import com.example.coffeespot.repository.IngredientRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public List<IngredientEntity> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    public IngredientEntity saveIngredient(IngredientEntity ingredient) {
        return ingredientRepository.save(ingredient);
    }

    @Transactional
    public void deleteIngredientIfOutOfStock(Long id) {
        IngredientEntity ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ингредиент не найден: " + id));

        if (ingredient.getStockQuantity() == null || ingredient.getStockQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Удалить можно только закончившийся ингредиент (остаток 0)");
        }

        ingredientRepository.deleteById(id);
    }
}
