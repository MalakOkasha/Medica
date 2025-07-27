// src/main/java/com/example/demo/dto/AdminRegisterRequest.java
package com.example.demo.dto;

import com.example.demo.dto.PasswordValidator;

public class AdminRegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String contactInfo;
    private long adminId;

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
        // Validate password security
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
// Getters and Setters
}
