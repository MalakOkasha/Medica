package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pharmaceutical_companies")

public class PharmaceuticalCompany {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String location;

    public PharmaceuticalCompany() {}

    public PharmaceuticalCompany(User user, String location) {
        this.user = user;
        this.location = location;
    }

    // Getters and Setters
    public Long getId() { return id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
