package com.example.demo.service;

import com.example.demo.model.Visit;
import com.example.demo.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VisitService {

    @Autowired
    private VisitRepository visitRepository;

    // Save a new visit
    public Visit saveVisit(Visit visit) {
        return visitRepository.save(visit);
    }

    // Get all visits for a specific patient
    public List<Visit> getVisitsByPatientId(Long patientId) {
        return visitRepository.findByPatientId(patientId);  // This calls the method from VisitRepository
    }



    // Get a visit by ID
    public Optional<Visit> getVisitById(Long visitId) {
        return visitRepository.findById(visitId);
    }

    // Delete a visit by ID
    public void deleteVisit(Long visitId) {
        visitRepository.deleteById(visitId);
    }
}

