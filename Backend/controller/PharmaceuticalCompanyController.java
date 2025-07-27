package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PasswordValidator;
import com.example.demo.dto.PharmaceuticalCompanyRegistrationRequest;
import com.example.demo.model.PharmaceuticalCompany;
import com.example.demo.model.User;
import com.example.demo.service.PharmaceuticalCompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.example.demo.dto.AdminRegisterRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Doctor;
import com.example.demo.model.Role;
import com.example.demo.model.*;
import com.example.demo.service.*;
import com.example.demo.repository.*;
import com.example.demo.dto.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pharma")
public class PharmaceuticalCompanyController {

    @Autowired
    private PharmaceuticalCompanyService companyService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PharmaceuticalCompanyRepository companyRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody PharmaceuticalCompanyRegistrationRequest request) {
        // Validate the password security manually
        String password = request.getPassword();
        if (!PasswordValidator.isPasswordSecure(password)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Password is not secure enough. Please follow the declared password criteria.");
        }

        // If the password is secure, proceed with company registration
        PharmaceuticalCompany registered = companyService.createCompany(request);
        return ResponseEntity.ok("Company registered successfully!");
    }

    @GetMapping("/all")
    public ResponseEntity<List<PharmaceuticalCompany>> getAllCompanies() {
        List<PharmaceuticalCompany> companies = companyService.getAllCompanies();
        return ResponseEntity.ok(companies);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteCompanyById(@PathVariable Long id, @RequestHeader("adminUserId") Long adminUserId) {
        try {
            companyService.deleteCompanyAndUserById(id, adminUserId);
            return ResponseEntity.ok("Company and associated user deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting company: " + e.getMessage());
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCompanyById(
            @PathVariable Long id,
            @RequestBody PharmaceuticalCompany updatedCompanyData) {

        try {
            // Call the service method to update the company
            companyService.updateCompanyById(id, updatedCompanyData);

            // Return a success response if update is successful
            return ResponseEntity.ok("Company updated successfully");
        } catch (ResponseStatusException e) {
            // Handle specific exceptions with proper HTTP status codes
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        } catch (Exception e) {
            // Handle general exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        Optional<PharmaceuticalCompany> companyOpt = companyService.getCompanyById(id);

        if (companyOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Company not found.");
        }

        return ResponseEntity.ok(companyOpt.get());
    }



}