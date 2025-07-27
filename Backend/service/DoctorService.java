package com.example.demo.service;

import com.example.demo.model.Doctor;
import com.example.demo.model.User;
import com.example.demo.model.Role;
import com.example.demo.model.Visit;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private VisitRepository visitRepository;  // Add VisitRepository for managing visits

    // Create a new doctor
    public Doctor createDoctor(User user, String specialization) {
        // Set the role to DOCTOR
        user.setRole(Role.DOCTOR);

        // Save the User entity
        User savedUser = userRepository.save(user);

        // Create a new Doctor instance with the saved User and specialization
        Doctor doctor = new Doctor(savedUser, specialization);

        // Save and return the Doctor entity
        return doctorRepository.save(doctor);
    }


    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public void deleteDoctorById(Long id) {
        doctorRepository.deleteById(id);
        userRepository.deleteById(id); // remove user too
    }


    public Doctor updateDoctor(Doctor updatedDoctor) {
        return doctorRepository.save(updatedDoctor);
    }
    // Method to get all visits for a patient assigned to this doctor
    public List<Visit> getPatientVisits(Long doctorId, Long patientId) {
        // You may want to add logic to ensure the doctor has access to the patient
        return visitRepository.findByPatientId(patientId);  // Fetch visits for the given patient
    }

    // Method to add a visit for a specific patient by a doctor
    public Visit addVisit(Long doctorId, Visit visit) {
        // You may want to ensure that the doctor has permission to add visits for the patient
        return visitRepository.save(visit);
    }

    public Optional<Doctor> getDoctorByContactInfo(String email) {
        return doctorRepository.findByUserContactInfo(email);
    }

}
