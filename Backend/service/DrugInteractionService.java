package com.example.demo.service;

import com.example.demo.model.DrugInteraction;
import com.example.demo.repository.DrugInteractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DrugInteractionService {

    @Autowired
    private DrugInteractionRepository repository;

    public List<DrugInteraction> checkInteraction(String drug1, String drug2) {
        List<DrugInteraction> results = repository.findByDrug1IgnoreCaseAndDrug2IgnoreCase(drug1, drug2);
        if (results.isEmpty()) {
            results = repository.findByDrug2IgnoreCaseAndDrug1IgnoreCase(drug1, drug2);
        }
        return results;
    }

    public void saveAll(List<DrugInteraction> interactions) {
        repository.saveAll(interactions);
    }
    public List<DrugInteraction> findAll() {
        return repository.findAll();
    }

}
