package com.example.demo.model;

import jakarta.persistence.*;

@Entity
public class ActiveIngredients {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String activeIngredient;

    @Column(length = 5000)
    private String description;

    public ActiveIngredients() {
    }

    public ActiveIngredients(String activeIngredient, String description) {
        this.activeIngredient = activeIngredient;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getActiveIngredient() {
        return activeIngredient;
    }

    public void setActiveIngredient(String activeIngredient) {
        this.activeIngredient = activeIngredient;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}