package com.example.demo.dto;

import java.util.regex.Pattern;

public class PasswordValidator {

    // Regex pattern for password validation
    private static final String PASSWORD_REGEX = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z\\d!@#$%^&*(),.?\":{}|<>]{8,}$";

    public static boolean isPasswordSecure(String password) {
        // Check if password matches the required regex pattern
        return Pattern.matches(PASSWORD_REGEX, password);
    }
}
