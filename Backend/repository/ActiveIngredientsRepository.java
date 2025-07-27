package com.example.demo.repository;

import com.example.demo.model.ActiveIngredients;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActiveIngredientsRepository extends JpaRepository<ActiveIngredients, Long> {
    Optional<ActiveIngredients> findByActiveIngredientIgnoreCase(String activeIngredient);

}