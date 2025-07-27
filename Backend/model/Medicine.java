package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;


    @Column(length = 1000)
    private String substitute0;
    @Column(length = 1000)
    private String substitute1;

    @Column(length = 1000)
    private String use0;


    @Column(length = 1000)
    private String use1;

    @Column(length = 1000)

    private String use2;
    @Column(length = 1000)
    private String sideeffect0;
    @Column(length = 1000)
    private String sideeffect1;


    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private PharmaceuticalCompany company;

    public PharmaceuticalCompany getCompany() {
        return company;
    }

    public void setCompany(PharmaceuticalCompany company) {
        this.company = company;
    }

    public String getSideeffect1() {
        return sideeffect1;
    }

    public void setSideeffect1(String sideeffect1) {
        this.sideeffect1 = sideeffect1;
    }

    public String getSideeffect0() {
        return sideeffect0;
    }

    public void setSideeffect0(String sideeffect0) {
        this.sideeffect0 = sideeffect0;
    }
    @Column(length = 1000)
    private String sideeffect2;
    public String getSideeffect2() {
        return sideeffect2;
    }

    public void setSideeffect2(String sideeffect2) {
        this.sideeffect2 = sideeffect2;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubstitute0() {
        return substitute0;
    }

    public void setSubstitute0(String substitute0) {
        this.substitute0 = substitute0;
    }

    public String getSubstitute1() {
        return substitute1;
    }

    public void setSubstitute1(String substitute1) {
        this.substitute1 = substitute1;
    }


    public String getUse0() {
        return use0;
    }

    public void setUse0(String use0) {
        this.use0 = use0;
    }

    public String getUse1() {
        return use1;
    }

    public void setUse1(String use1) {
        this.use1 = use1;
    }

    public String getUse2() {
        return use2;
    }

    public void setUse2(String use2) {
        this.use2 = use2;
    }
}
