package com.example.demo.controller;

import com.example.demo.model.DrugInteraction;
import com.example.demo.repository.DrugInteractionRepository;
import com.example.demo.service.DrugInteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interactions")
public class DrugInteractionController {

    @Autowired
    private DrugInteractionService service;

    @Autowired
    private DrugInteractionRepository drugInteractionRepository;


    @GetMapping("/check")
    public ResponseEntity<?> checkInteraction(@RequestParam String drug1, @RequestParam String drug2) {
        List<DrugInteraction> interactions = service.checkInteraction(drug1, drug2);
        if (interactions.isEmpty()) {
            return ResponseEntity.ok("No known interaction between " + drug1 + " and " + drug2);
        }
        return ResponseEntity.ok(interactions);
    }

    @GetMapping("/search")
    public ResponseEntity<List<DrugInteraction>> searchDrugPrefix(@RequestParam("name") String name) {
        List<DrugInteraction> matches = drugInteractionRepository.searchByDrugPrefix(name);
        return ResponseEntity.ok(matches);
    }
}
