package com.example.demo.controller;

import com.example.demo.dto.VisitDTO;
import com.example.demo.dto.VisitResponseDTO;
import com.example.demo.model.Visit;
import com.example.demo.service.VisitService;
import com.example.demo.service.PatientService;
import com.example.demo.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    @Autowired
    private VisitService visitService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    // POST: Create a new visit
    @PostMapping("/add")
    public ResponseEntity<?> addVisit(@RequestBody VisitDTO visitDTO) {
        try {
            Visit visit = new Visit();
            visit.setPatient(patientService.getPatientById(visitDTO.getPatientId()).orElseThrow(() -> new Exception("Patient not found")));
            visit.setDoctor(doctorService.getDoctorById(visitDTO.getDoctorId()).orElseThrow(() -> new Exception("Doctor not found")));
            visit.setVisitDate(new SimpleDateFormat("yyyy-MM-dd").parse(visitDTO.getVisitDate())); // Parse visit date from string

            // Set additional fields
            visit.setDiagnosis(visitDTO.getDiagnosis());
            visit.setSymptoms(visitDTO.getSymptoms());
            visit.setPrescribedMedicine(visitDTO.getPrescribedMedicine());
            visit.setTreatmentEffect(visitDTO.getTreatmentEffect());

            Visit savedVisit = visitService.saveVisit(visit);  // Save the visit using VisitService
            return ResponseEntity.ok(savedVisit);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error creating visit: " + e.getMessage());
        }
    }

    // GET: Fetch all visits for a specific patient
    @GetMapping("/{patientId}")
    public ResponseEntity<?> getVisitsByPatientId(@PathVariable Long patientId) {
        try {
            List<Visit> visits = visitService.getVisitsByPatientId(patientId);
            if (visits.isEmpty()) {
                return ResponseEntity.status(404).body("No visits found for this patient.");
            }

            List<VisitDTO> visitDTOs = visits.stream().map(visit ->
                    new VisitDTO(
                            visit.getId(),
                            visit.getPatient().getId(),
                            visit.getDoctor().getId(),
                            visit.getVisitDate().toString(),
                            visit.getDiagnosis(), // Include diagnosis
                            visit.getSymptoms(),  // Include symptoms
                            visit.getPrescribedMedicine(), // Include prescribed medicine
                            visit.getTreatmentEffect() // Include treatment effect
                    )
            ).collect(Collectors.toList());

            return ResponseEntity.ok(visitDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error fetching visits: " + e.getMessage());
        }
    }

    // PUT: Edit (Update) an existing visit
    @PutMapping("/{visitId}/update")
    public ResponseEntity<?> updateVisit(@PathVariable Long visitId, @RequestBody VisitDTO visitDTO) {
        try {
            Optional<Visit> visitOptional = visitService.getVisitById(visitId);
            if (!visitOptional.isPresent()) {
                return ResponseEntity.status(404).body("Visit not found.");
            }
            Visit visit = visitOptional.get();

            if (visitDTO.getDoctorId() != null) {
                visit.setDoctor(doctorService.getDoctorById(visitDTO.getDoctorId()).orElseThrow(() -> new Exception("Doctor not found")));
            }
            if (visitDTO.getPatientId() != null) {
                visit.setPatient(patientService.getPatientById(visitDTO.getPatientId()).orElseThrow(() -> new Exception("Patient not found")));
            }
            if (visitDTO.getVisitDate() != null) {
                visit.setVisitDate(new SimpleDateFormat("yyyy-MM-dd").parse(visitDTO.getVisitDate()));
            }

            // Update new fields
            if (visitDTO.getDiagnosis() != null) {
                visit.setDiagnosis(visitDTO.getDiagnosis());
            }
            if (visitDTO.getSymptoms() != null) {
                visit.setSymptoms(visitDTO.getSymptoms());
            }
            if (visitDTO.getPrescribedMedicine() != null) {
                visit.setPrescribedMedicine(visitDTO.getPrescribedMedicine());
            }
            if (visitDTO.getTreatmentEffect() != null) {
                visit.setTreatmentEffect(visitDTO.getTreatmentEffect());
            }

            Visit updatedVisit = visitService.saveVisit(visit);  // Save the updated visit

            VisitResponseDTO responseDTO = new VisitResponseDTO(
                    updatedVisit.getId(),
                    updatedVisit.getPatient().getId(),
                    updatedVisit.getDoctor().getId(),
                    updatedVisit.getVisitDate().toString(),
                    updatedVisit.getDiagnosis(), // Include diagnosis
                    updatedVisit.getSymptoms(),  // Include symptoms
                    updatedVisit.getPrescribedMedicine(), // Include prescribed medicine
                    updatedVisit.getTreatmentEffect() // Include treatment effect
            );

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error updating visit: " + e.getMessage());
        }
    }

    // DELETE: Delete a visit by visitId
    @DeleteMapping("/{visitId}/delete")
    public ResponseEntity<?> deleteVisit(@PathVariable Long visitId) {
        try {
            Optional<Visit> visitOptional = visitService.getVisitById(visitId);
            if (!visitOptional.isPresent()) {
                return ResponseEntity.status(404).body("Visit not found.");
            }

            visitService.deleteVisit(visitId);  // Delete the visit using the service
            return ResponseEntity.ok("Visit deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error deleting visit: " + e.getMessage());
        }
    }
}
