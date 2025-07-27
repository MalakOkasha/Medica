package com.example.demo.controller;

import com.example.demo.dto.AdminRegisterRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.model.Doctor;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.service.ActionLogService;
import com.example.demo.service.DoctorService;
import com.example.demo.service.UserService;
import com.example.demo.dto.PasswordValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController
{
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserService userService;
    private DoctorService doctorService;
    @Autowired
    private ActionLogService actionLogService;  // Add this line to inject ActionLogService


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Log login attempt
            //actionLogService.logAction("Login attempt", "User with email " + request.getEmail() + " tried to log in.", request.getEmail());

            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // Log successful login attempt
                actionLogService.logAction("Login attempt", "User with email " + request.getEmail() + " logged in successfully.", request.getEmail(), null);
                return ResponseEntity.ok("Login successful: " + user.getFullName() + " [" + user.getRole() + "] [" + user.getId() + "]");
            } else {
                // Log failed login attempt due to incorrect password
                actionLogService.logAction("Login attempt failed", "Incorrect password entered for user with email " + request.getEmail() + ".", request.getEmail(), null);
                return ResponseEntity.status(401).body("Incorrect password.");
            }
        }
        else
        {
            actionLogService.logAction("Login attempt failed", "User with email " + request.getEmail() + " not found.", request.getEmail(),null);
            return ResponseEntity.status(404).body("User not found.");
        }

    }

//    @PostMapping("/admin/register")
//    public ResponseEntity<?> registerAdmin(@RequestBody User admin) {
//        // Check if email is already taken
//        Optional<User> existing = userService.findByEmail(admin.getEmail());
//        if (existing.isPresent()) {
//            return ResponseEntity.badRequest().body("Email already exists.");
//        }
//        existing = userService.findByUserContactInfo(admin.getContactInfo());
//        if (existing.isPresent()) {
//            return ResponseEntity.badRequest().body("Phone number already exists.");
//        }
//
//        // Password security validation (Use a password validation utility here)
//        if (!PasswordValidator.isPasswordSecure(admin.getPassword())) {
//            return ResponseEntity.badRequest().body("Password is not secure enough. Please follow the declared password criteria.");
//        }
//
//        admin.setPassword(passwordEncoder.encode(admin.getPassword())); // 🔐 Hashing
//        // Set the role for the user
//        admin.setRole(Role.ADMIN);
//
//        // Save the user
//        User savedAdmin = userService.saveUser(admin);
//
//        return ResponseEntity.ok(savedAdmin);
//    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout successful.");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestHeader("adminUserId") Long adminUserId) {
        if (!userService.existsById(id)) {
            return ResponseEntity.status(404).body("User not found");
        }
        userService.deleteById(id);

        Optional<User> userOpt = userService.getUserById(adminUserId);
        User adminUser = userOpt.get();

        actionLogService.logAction(
                "User deleted",
                "Deleted user with ID: " + id,
                adminUser.getEmail(), adminUserId
        );
        return ResponseEntity.ok("User deleted");
    }


    @GetMapping("/admins")
    public ResponseEntity<List<User>> getAllAdmins() {
        return ResponseEntity.ok(userService.findUsersByRole(Role.ADMIN));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Admin not found.");
        }

        User user = userOpt.get();
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("User is not an admin.");
        }

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id, @RequestHeader("adminUserId") Long adminUserId) {
        Optional<User> userOpt = userService.getUserById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Admin not found.");
        }

        User user = userOpt.get();
        if (user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("User is not an admin.");
        }
        userService.deleteById(id);

        Optional<User> userOptt = userService.getUserById(adminUserId);
        User adminUser = userOptt.get();

        actionLogService.logAction(
                "Admin deleted",
                "Deleted admin with ID: " + id,
                adminUser.getEmail(), adminUserId
        );
        return ResponseEntity.ok("Admin deleted successfully.");
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdminByAdmin(
            @RequestBody AdminRegisterRequest request
    ) {
        // Validate email uniqueness
        Optional<User> existingEmail = userService.findByEmail(request.getEmail());
        if (existingEmail.isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }
        // Validate phone format
        String phone = request.getContactInfo();
        if (phone == null || !phone.matches("^01\\d{9}$")) {
            return ResponseEntity.badRequest().body(
                    "Phone number must be 11 digits, start with 01 and contain only digits."
            );
        }
        // Validate phone uniqueness
        Optional<User> existingContact = userService.findByUserContactInfo(phone);
        if (existingContact.isPresent()) {
            return ResponseEntity.badRequest().body("Phone number already exists.");
        }
        // Validate password security
        String rawPassword = request.getPassword();
        if (!PasswordValidator.isPasswordSecure(rawPassword)) {
            return ResponseEntity.badRequest().body(
                    "Password is not secure enough. Please follow the declared password criteria."
            );
        }
        // Create new admin
        User newAdmin = new User();
        newAdmin.setFullName(request.getFullName());
        newAdmin.setEmail(request.getEmail());
        newAdmin.setContactInfo(phone);
        newAdmin.setPassword(passwordEncoder.encode(rawPassword));
        newAdmin.setRole(Role.ADMIN);
        User savedAdmin = userService.saveUser(newAdmin);
        // Log action
        userService.getUserById(request.getAdminId()).ifPresent(admin ->
                actionLogService.logAction(
                        "Admin account created",
                        "Admin Name: " + savedAdmin.getFullName(),
                        admin.getEmail(), request.getAdminId()
                )
        );
        return ResponseEntity.ok(savedAdmin);
    }

    @PutMapping("/admin/edit/{id}")
    public ResponseEntity<?> editAdmin(
            @PathVariable Long id,
            @RequestBody User updatedData
    ) {
        Optional<User> adminOpt = userService.getUserById(id);
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Admin not found.");
        }
        User existingAdmin = adminOpt.get();
        if (existingAdmin.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body("User is not an admin.");
        }
        // Update fullName
        if (updatedData.getFullName() != null &&
                !updatedData.getFullName().equals(existingAdmin.getFullName())) {
            existingAdmin.setFullName(updatedData.getFullName());
        }
        // Update email
        if (updatedData.getEmail() != null &&
                !updatedData.getEmail().equals(existingAdmin.getEmail())) {
            Optional<User> emailCheck = userService.findByEmail(updatedData.getEmail());
            if (emailCheck.isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists.");
            }
            existingAdmin.setEmail(updatedData.getEmail());
        }
        // Update phone
        if (updatedData.getContactInfo() != null &&
                !updatedData.getContactInfo().equals(existingAdmin.getContactInfo())) {
            String newPhone = updatedData.getContactInfo();
            if (!newPhone.matches("^01\\d{9}$")) {
                return ResponseEntity.badRequest().body(
                        "Phone number must be 11 digits, start with 01 and contain only digits."
                );
            }
            Optional<User> phoneCheck = userService.findByUserContactInfo(newPhone);
            if (phoneCheck.isPresent()) {
                return ResponseEntity.badRequest().body("Phone number already exists.");
            }
            existingAdmin.setContactInfo(newPhone);
        }
        // Update password
        if (updatedData.getPassword() != null) {
            String newRawPassword = updatedData.getPassword();
            if (!PasswordValidator.isPasswordSecure(newRawPassword)) {
                return ResponseEntity.badRequest().body(
                        "Password is not secure enough. Please follow the declared password criteria."
                );
            }
            existingAdmin.setPassword(passwordEncoder.encode(newRawPassword));
        }
        // Save and log
        User savedAdmin = userService.saveUser(existingAdmin);
        actionLogService.logAction(
                "Admin updated",
                "Admin account updated for ID: " + savedAdmin.getId(),
                savedAdmin.getEmail(), savedAdmin.getId()
        );
        return ResponseEntity.ok(savedAdmin);
    }

}
