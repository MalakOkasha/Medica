package com.example.demo.controller;

import com.example.demo.dto.VisitDTO;
import com.example.demo.model.Doctor;
import com.example.demo.model.Patient;
import com.example.demo.model.Role;
import com.example.demo.model.Visit;
import com.example.demo.service.DoctorService;
import com.example.demo.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id).map(patient ->
                ResponseEntity.ok((Object) patient)
        ).orElse(ResponseEntity.status(404).body("Patient not found."));
    }


    @GetMapping("/assigned")
    public ResponseEntity<?> getPatientsForDoctor(@RequestParam Long doctorId) {
        List<Patient> patients = patientService.getPatientsByDoctorId(doctorId);
        if (patients.isEmpty()) {
            return ResponseEntity.status(404).body("No patients found for this doctor.");
        }
        return ResponseEntity.ok(patients);
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<Patient> updatePatientRecord(@PathVariable Long id, @RequestBody Patient updatedData) {
        return patientService.getPatientById(id).map(patient -> {
            //    if (updatedData.getDiagnosis() != null)
            //        patient.setDiagnosis(updatedData.getDiagnosis());
            //    if (updatedData.getPrescribedMedicine() != null)
            //        patient.setPrescribedMedicine(updatedData.getPrescribedMedicine());
            //    if (updatedData.getTreatmentEffect() != null)
            //        patient.setTreatmentEffect(updatedData.getTreatmentEffect());

            Patient updatedPatient = patientService.savePatient(patient);
            return ResponseEntity.ok(updatedPatient);
        }).orElse(ResponseEntity.status(404).build());
    }

    @PutMapping("/{id}/edit")
    public ResponseEntity<Patient> editPatient(@PathVariable Long id, @RequestBody Patient updatedData) {
        return patientService.getPatientById(id).map(existing -> {
            if (updatedData.getName() != null) existing.setName(updatedData.getName());
            if (updatedData.getPhoneNumber() != null) existing.setPhoneNumber(updatedData.getPhoneNumber());
            if (updatedData.getBloodType() != null) existing.setBloodType(updatedData.getBloodType());
            if (updatedData.getAge() != null) existing.setAge(updatedData.getAge());
            //   if (updatedData.getDiagnosis() != null) existing.setDiagnosis(updatedData.getDiagnosis());
            //    if (updatedData.getSymptoms() != null) existing.setSymptoms(updatedData.getSymptoms());
            if (updatedData.getHistory() != null) existing.setHistory(updatedData.getHistory());
            //   if (updatedData.getPrescribedMedicine() != null) existing.setPrescribedMedicine(updatedData.getPrescribedMedicine());
            //  if (updatedData.getTreatmentEffect() != null) existing.setTreatmentEffect(updatedData.getTreatmentEffect());
            // if (updatedData.getVisit1Date() != null)
            //     existing.setVisit1Date(updatedData.getVisit1Date());
            //  if (updatedData.getVisit2Date() != null)
            //     existing.setVisit2Date(updatedData.getVisit2Date());
            if (updatedData.getGender() != null) existing.setGender(updatedData.getGender());

            return ResponseEntity.ok(patientService.savePatient(existing));
        }).orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/addpatient")
    public ResponseEntity<?> addPatient(@RequestBody @Valid Patient patient, BindingResult result) {
        // Check if there are any validation errors (such as invalid phone number format)
        if (result.hasErrors()) {
            String errorMessage = result.getAllErrors().get(0).getDefaultMessage();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
        }

        // Custom validation: Check if phone number is exactly 11 digits
        String phoneNumber = patient.getPhoneNumber();
        if (phoneNumber.length() != 11) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number must be exactly 11 digits long.");
        }

        // Check if phone number starts with '01'
        if (!phoneNumber.startsWith("01")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Phone number must start with '01'.");
        }

        // Check if a patient with the same phone number already exists
        Optional<Patient> existingPatient = patientService.getPatientByPhoneNumber(patient.getPhoneNumber());
        if (existingPatient.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Patient with this phone number already exists.");
        }

        // If no validation error, proceed to save the patient
        Patient savedPatient = patientService.savePatient(patient);
        return ResponseEntity.ok(savedPatient);
    }



    @GetMapping("/getAllPatients")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        patientService.deletePatientById(id);
        return ResponseEntity.ok("Patient deleted successfully.");
    }



}
