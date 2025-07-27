package com.example.demo.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Pattern;

public class PharmaceuticalCompanyRegistrationRequest {
    private String fullName;
    private String email;
    private String password;
    @Pattern(regexp = "^01[0-9]{9}$", message = "Phone number must be Egyptian and exactly 11 digits long, starting with 01")
    @Column(unique = true)
    private String contactInfo;
    private String location;

    private long adminId;

    // Getters and Setters


    public long getAdminId() {
        return adminId;
    }

    public void setAdminId(long adminId) {
        this.adminId = adminId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        if (!PasswordValidator.isPasswordSecure(password)) {
            throw new IllegalArgumentException("Password is not secure enough. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.");
        }
        this.password = password;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
