package com.example.demo.controller;

import com.example.demo.dto.AddMedicineRequest;
import com.example.demo.dto.UpdateMedicineRequest;
import com.example.demo.model.Medicine;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.service.MedicineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    /*@GetMapping("/search")
    public ResponseEntity<?> searchMedicine(@RequestParam String name) {
        return medicineService.findByName(name)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("Medicine not found."));
    }
*/
    @PostMapping("/add")
    public ResponseEntity<?> addMedicine(@RequestBody AddMedicineRequest request) {
        try {
            Optional<Medicine> added = Optional.ofNullable(medicineService.addMedicine(request));
            return added
                    .map(m -> ResponseEntity.ok("Medicine added successfully."))
                    .orElseGet(() -> ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .body("Pharmaceutical company not found."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }



    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteMedicine(
            @RequestParam Long companyId,
            @RequestParam Long medicineId) {

        try {
            String result = medicineService.deleteMedicine(companyId, medicineId);
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateMedicine(
            @RequestParam Long companyId,
            @RequestParam Long medicineId,
            @RequestBody UpdateMedicineRequest request) {
        String result = medicineService.updateMedicine(companyId, medicineId, request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload-dataset")
    public ResponseEntity<String> uploadDataset(
            @RequestParam("file") MultipartFile file,
            @RequestParam("companyId") Long companyId) {

        // Validate file type - only allow CSV files
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("text/csv") && !file.getOriginalFilename().endsWith(".csv")) {
            // Return error response if the file is not a CSV
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid file type. Please upload a CSV file.");
        }

        try {
            String result = medicineService.processMedicineDataset(file, companyId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Handle any exceptions thrown by the service
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload failed: " + e.getMessage());
        }
    }


    @GetMapping("/by-company/{companyId}")
    public ResponseEntity<List<Medicine>> getAllMedicinesByCompanyId(@PathVariable Long companyId) {
        List<Medicine> medicines = medicineService.getMedicinesByCompanyId(companyId);
        if (medicines.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/getMedicineById")
    public ResponseEntity<Medicine> getMedicineByCompanyAndId(
            @RequestParam Long companyId,
            @RequestParam Long medicineId) {

        return medicineService.getMedicineByCompanyAndId(companyId, medicineId)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicine not found"));
    }

    @GetMapping("/search")
    public List<Medicine> searchMedicines(@RequestParam String name) {
        return medicineRepository.searchByNamePrefix(name);
    }



}
