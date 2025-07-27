package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "favorite_companies")
public class Favorites {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId;
    private Long doctorId;

    public Favorites() {}

    public Favorites(Long companyId, Long doctorId) {
        this.companyId = companyId;
        this.doctorId = doctorId;
    }



    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
}
