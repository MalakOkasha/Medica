package com.example.demo.controller;

import com.example.demo.dto.PasswordValidator;
import com.example.demo.model.*;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.*;
import com.example.demo.service.PatientService;
//import org.hibernate.annotations.processing.Pattern;
import jakarta.persistence.Column;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Pattern;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/doctors")
@Validated
public class DoctorController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserService userService;
    @Autowired
    private DoctorRepository doctorRepository;  // Inject the DoctorRepository
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActionLogService actionLogService;



    @PostMapping("/create")
    public ResponseEntity<?> createDoctor(@RequestBody DoctorRequest request) {
        // Email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }
        // Phone format and uniqueness
        String phone = request.getContactInfo();
        if (phone == null || !phone.matches("^01\\d{9}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Phone number must be 11 digits, start with 01 and contain only digits.");
        }
        if (doctorRepository.findByUserContactInfo(phone).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Phone number already exists.");
        }
        // Password security
        String rawPass = request.getPassword();
        if (!PasswordValidator.isPasswordSecure(rawPass)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Password is not secure enough. Please follow the declared password criteria.");
        }
        // Create user account for doctor
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setContactInfo(phone);
        user.setPassword(passwordEncoder.encode(rawPass));
        user.setRole(Role.DOCTOR);
        // Persist via doctorService
        Doctor doctor = doctorService.createDoctor(user, request.getSpecialization());
        // Log action
        userService.getUserById(request.getUserId()).ifPresent(admin ->
                actionLogService.logAction(
                        "Doctor account created",
                        "Doctor Name: " + doctor.getUser().getFullName() + ", Specialization: " + doctor.getSpecialization(),
                        admin.getEmail(), request.getUserId()
                )
        );
        return ResponseEntity.ok(doctor);
    }

    // @PostMapping("/create")
  //  public ResponseEntity<Doctor> createDoctor(@RequestBody DoctorRequest request) {
  //      User user = new User(
  //              request.getFullName(),
  //              request.getEmail(),
  //              request.getPassword(),
   //             null, // role will be set to DOCTOR in service
  //              request.getContactInfo()
   //     );
 //       Doctor doctor = doctorService.createDoctor(user, request.getSpecialization());
  //      return ResponseEntity.ok(doctor);
 //   }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {

        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateDoctor(
            @PathVariable Long id,
            @RequestBody DoctorRequest request
    ) {
        Optional<Doctor> optionalDoctor = doctorService.getDoctorById(id);
        if (optionalDoctor.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Doctor not found.");
        }
        Doctor doctor = optionalDoctor.get();
        boolean updated = false;
        User user = doctor.getUser();
        // Update fullName
        if (request.getFullName() != null && !request.getFullName().equals(user.getFullName())) {
            user.setFullName(request.getFullName());
            updated = true;
        }
        // Update email with uniqueness check
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            Optional<User> emailCheck = userService.findByEmail(request.getEmail());
            if (emailCheck.isPresent() && !emailCheck.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Email already exists.");
            }
            user.setEmail(request.getEmail());
            updated = true;
        }
        // Update phone with format and uniqueness check
        if (request.getContactInfo() != null && !request.getContactInfo().equals(user.getContactInfo())) {
            String newPhone = request.getContactInfo();
            if (!newPhone.matches("^01\\d{9}$")) {
                return ResponseEntity.badRequest().body(
                        "Phone number must be 11 digits, start with 01 and contain only digits."
                );
            }
            Optional<User> phoneCheck = userService.findByUserContactInfo(newPhone);
            if (phoneCheck.isPresent() && !phoneCheck.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Phone number already exists.");
            }
            user.setContactInfo(newPhone);
            updated = true;
        }
        // Update specialization
        if (request.getSpecialization() != null && !request.getSpecialization().equals(doctor.getSpecialization())) {
            doctor.setSpecialization(request.getSpecialization());
            updated = true;
        }
        // Update password with security check
        if (request.getPassword() != null) {
            if (!PasswordValidator.isPasswordSecure(request.getPassword())) {
                return ResponseEntity.badRequest().body(
                        "Password is not secure enough. Please follow the declared password criteria."
                );
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            updated = true;
        }
        if (!updated) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No changes detected.");
        }
        // Persist changes
        Doctor updatedDoctor = doctorService.updateDoctor(doctor);
        // Log action
        userService.getUserById(request.getUserId()).ifPresent(admin ->
                actionLogService.logAction(
                        "Doctor account updated",
                        "Updated doctor ID: " + updatedDoctor.getId(),
                        admin.getEmail(), request.getUserId()
                )
        );
        return ResponseEntity.ok(updatedDoctor);
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id, @RequestHeader("adminUserId") Long adminUserId) {
        doctorService.deleteDoctorById(id);
        Optional<User> userOpt = userService.getUserById(adminUserId);

        User adminUser = userOpt.get();
        //adminUser.getEmail(), request.getUserId()


        actionLogService.logAction(
                "Doctor account deleted",
                "Deleted doctor ID: " + id,
                adminUser.getEmail(), adminUserId// Log the admin's userId from the request header
                 // Log the admin's username
        );
        return ResponseEntity.ok("Doctor deleted successfully.");
    }

    public static class DoctorRequest {
        private String fullName;
        private String email;
        private String password;

        @Pattern(regexp = "^01[0-9]{9}$", message = "Phone number must be Egyptian and exactly 11 digits long, starting with 01")
        @Column(unique = true)
        private String contactInfo;
        private String specialization;
        private Long userId; // This will be the admin's userId

        // Getters and Setters

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getContactInfo() { return contactInfo; }
        public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctorOpt = doctorService.getDoctorById(id);

        if (doctorOpt.isPresent()) {
            return ResponseEntity.ok(doctorOpt.get());
        } else {
            return ResponseEntity.status(404).body("Doctor not found with ID: " + id);
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "UNKNOWN";
    }

}
