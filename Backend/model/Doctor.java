package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    private Long id; // same as user ID

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String specialization;

    public Doctor() {}

    public Doctor(User user, String specialization) {
        this.user = user;
        this.specialization = specialization;
    }

    // Getters and Setters
    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}
