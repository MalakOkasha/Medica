package com.example.demo.service;

import com.example.demo.model.Patient;
import com.example.demo.model.Visit;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private VisitRepository visitRepository;  // Add VisitRepository for managing visits


    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient savePatient(Patient patient) {
        return patientRepository.save(patient);
    }


    public List<Patient> getPatientsByDoctorId(Long doctorId) {
        return patientRepository.findByDoctorId(doctorId);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public void deletePatientById(Long id) {
        patientRepository.deleteById(id);
    }
    public Optional<Patient> getPatientByPhoneNumber(String phoneNumber) {
        return patientRepository.findByPhoneNumber(phoneNumber);
    }

    // Method to get all visits for a patient
    public List<Visit> getPatientVisits(Long patientId) {
        return visitRepository.findByPatientId(patientId);  // Fetch visits for the patient
    }

    // Method to save a new visit for a patient
    public Visit saveVisit(Visit visit) {
        return visitRepository.save(visit);  // Save the visit record
    }

    // Method to get a visit by its ID
    public Optional<Visit> getVisitById(Long visitId) {
        return visitRepository.findById(visitId);
    }

    // Method to delete a visit by its ID
    public void deleteVisitById(Long visitId) {
        visitRepository.deleteById(visitId);  // Delete the visit record
    }

}
