package com.example.coffeespot.controller;

import com.example.coffeespot.entity.CoffeeDrinkEntity;
import com.example.coffeespot.service.CoffeeDrinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/drinks")
public class CoffeeDrinkController {

    private final CoffeeDrinkService coffeeDrinkService;

    @GetMapping
    public List<CoffeeDrinkEntity> getAllDrinks() {
        return coffeeDrinkService.getAllDrinks();
    }

    @PostMapping
    public CoffeeDrinkEntity createDrink(@RequestBody CoffeeDrinkEntity drink) {
        return coffeeDrinkService.saveDrink(drink);
    }

    @PostMapping("/{id}/sell")
    public CoffeeDrinkEntity sellDrink(@PathVariable Long id) {
        return coffeeDrinkService.sellDrink(id);
    }
}