package com.example.demo.util;

import com.example.demo.model.DrugInteraction;
import com.example.demo.service.DrugInteractionService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class DrugInteractionLoader {

    @Autowired
    private DrugInteractionService service;

    @PostConstruct
    public void loadInteractions() {
        // Skip if already loaded
        if (!service.findAll().isEmpty()) return;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(getClass().getResourceAsStream("/interactions.csv"), StandardCharsets.UTF_8))) {

            List<DrugInteraction> interactions = new ArrayList<>();
            String line;
            boolean first = true;

            while ((line = reader.readLine()) != null) {
                if (first) { first = false; continue; } // Skip header
                String[] parts = line.split(",", 3);
                if (parts.length < 3) continue;

                DrugInteraction interaction = new DrugInteraction();
                interaction.setDrug1(parts[0].trim());
                interaction.setDrug2(parts[1].trim());
                interaction.setInteractionDescription(parts[2].trim());

                interactions.add(interaction);
            }

            service.saveAll(interactions);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
