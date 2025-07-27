package com.example.demo.controller;

import com.example.demo.model.ActiveIngredients;
import com.example.demo.repository.ActiveIngredientsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ingredients")
public class ActiveIngredientsController {

    private final ActiveIngredientsRepository repository;

    public ActiveIngredientsController(ActiveIngredientsRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ActiveIngredients> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ActiveIngredients getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }

    @GetMapping("/description")
    public ResponseEntity<String> getDescription(@RequestParam String name) {
        Optional<ActiveIngredients> ingredient = repository.findByActiveIngredientIgnoreCase(name);
        if (ingredient.isPresent()) {
            return ResponseEntity.ok(ingredient.get().getDescription());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No description found.");
        }
    }
}