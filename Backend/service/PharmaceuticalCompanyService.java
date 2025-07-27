package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PharmaceuticalCompanyRegistrationRequest;
import com.example.demo.model.PharmaceuticalCompany;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.PharmaceuticalCompanyRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class PharmaceuticalCompanyService {

    @Autowired
    private PharmaceuticalCompanyRepository pharmaRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;

    @Autowired
    private ActionLogService actionLogService;

    public PharmaceuticalCompany createCompany(PharmaceuticalCompanyRegistrationRequest request) {

        // Custom phone number validation: Only 11 digits and starts with '01'
        String contactInfo = request.getContactInfo();

        // Check phone number length
        if (contactInfo.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must be exactly 11 digits.");
        }
        if (!contactInfo.matches("\\d+")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number must contain only digits");
        }
        // Check if phone number starts with '01'
        if (!contactInfo.startsWith("01")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone number must start with '01'.");
        }
        // Check if the email is already registered
        Optional<User> existingEmail = userRepository.findByEmail(request.getEmail());
        if (existingEmail.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        // Check if the contactInfo (phone number) is already registered
        Optional<User> existingContactInfo = userRepository.findByContactInfo(request.getContactInfo());
        if (existingContactInfo.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        // Create the new User with the provided details
        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()), // ✅ hash password
                Role.PHARMA_COMPANY,
                request.getContactInfo()
        );

        // Save the user to the database
        User savedUser = userRepository.save(user);

        // Create the PharmaceuticalCompany object and associate it with the saved user
        PharmaceuticalCompany company = new PharmaceuticalCompany(savedUser, request.getLocation());

        Optional<User> userOpt = userService.getUserById(request.getAdminId());

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Admin with ID " + request.getAdminId() + " not found.");
        }
        User adminUser = userOpt.get();
        //adminUser.getEmail(), request.getUserId()

        actionLogService.logAction(
                "Pharma Company account created",
                "Company Name: " + company.getUser().getFullName(),
                adminUser.getEmail(), request.getAdminId()  // Log the userId passed in the request
        );
        // Save and return the pharmaceutical company
        return pharmaRepo.save(company);
    }

    public List<PharmaceuticalCompany> getAllCompanies() {
        return pharmaRepo.findAll();

    }

    public void deleteCompanyAndUserById(Long companyId, Long adminUserId) {
        PharmaceuticalCompany company = pharmaRepo.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

        Long companyUserId = company.getUser().getId();

        // Delete company first (if User has cascade = none)
        pharmaRepo.deleteById(companyId);

        // Delete user after
        userRepository.deleteById(companyUserId);

        Optional<User> userOpt = userService.getUserById(adminUserId);
        User adminUser = userOpt.get();

        actionLogService.logAction(
                "Company account deleted",
                "Deleted Company ID: " + companyId,
                adminUser.getEmail(), adminUserId// Log the admin's userId from the request header
                // Log the admin's username
        );
    }
    @Transactional
    public void updateCompanyById(Long companyId,
                                  PharmaceuticalCompany updatedCompanyData) {
        // 1) Load the existing entity
        PharmaceuticalCompany existingCompany = pharmaRepo
                .findPharmaceuticalCompanyById(companyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Company not found with id: " + companyId
                ));

        User existingUser = existingCompany.getUser();

        String newEmail = updatedCompanyData.getUser().getEmail();
        Optional<User> emailConflict = userRepository.findByEmail(newEmail);
        if (emailConflict.isPresent() &&
                !emailConflict.get().getId().equals(existingUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }
        String newContact = updatedCompanyData.getUser().getContactInfo();

        // 3.1 Uniqueness
        Optional<User> contactConflict = userRepository.findByContactInfo(newContact);
        if (contactConflict.isPresent() &&
                !contactConflict.get().getId().equals(existingUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number already registered"
            );
        }
        // 3.2 Digits‐only
        if (!newContact.matches("\\d+")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must contain only digits"
            );
        }
        // 3.3 Length
        if (newContact.length() != 11) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must be 11 digits"
            );
        }
        // 3.4 Prefix
        if (!newContact.startsWith("01")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number must start with 01"
            );
        }
        existingUser.setFullName(
                updatedCompanyData.getUser().getFullName()
        );
        existingUser.setEmail(newEmail);
        existingUser.setContactInfo(newContact);
        String rawPassword = updatedCompanyData.getUser().getPassword();
        if (rawPassword != null && !rawPassword.isBlank()) {
            existingUser.setPassword(
                    passwordEncoder.encode(rawPassword)
            );
        }
        existingCompany.setLocation(
                updatedCompanyData.getLocation()
        );
    }



    public Optional<PharmaceuticalCompany> getCompanyById(Long id) {
        return pharmaRepo.findPharmaceuticalCompanyById(id);
    }
}