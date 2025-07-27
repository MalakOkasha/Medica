package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String bloodType;
    private String gender;
    private Integer age;

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
// private String diagnosis;

    @Column(unique = true)
    // Apply validation for phoneNumber (Egyptian phone number)
    @Pattern(regexp = "^01[0-9]{9}$", message = "Phone number must be a valid Egyptian phone number (11 digits, starting with 01).")
    private String phoneNumber;
    //  private String phoneNumber;

    //   private String symptoms;

    @Column(length = 2000)
    private String history;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    //@JsonIgnore
    private User doctor;

    //  @Temporal(TemporalType.DATE)
    //  private Date visit1Date;

    // @Temporal(TemporalType.DATE)
    //  private Date visit2Date;

    // public Date getVisit1Date() {
    //      return visit1Date;
    //  }
    // @JsonFormat(pattern = "yyyy-MM-dd")
    //  public void setVisit1Date(Date visit1Date) {
    //      this.visit1Date = visit1Date;
    //   }

    // @JsonFormat(pattern = "yyyy-MM-dd")
    // public Date getVisit2Date() {
    //     return visit2Date;
//    }

    // public void setVisit2Date(Date visit2Date) {
    //     this.visit2Date = visit2Date;
    ///   }

    // Constructors
    public Patient() {
    }

    public Patient(String name, String bloodType, Integer age, String phoneNumber, String history, String gender) {
        this.name = name;
        this.bloodType = bloodType;
        this.age = age;
        //  this.diagnosis = diagnosis;
        this.phoneNumber = phoneNumber;
        //  this.symptoms = symptoms;
        this.history = history;
        this.gender=gender;
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

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    //  public String getDiagnosis() { return diagnosis; }
    //  public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    //  public String getSymptoms() { return symptoms; }
    //   public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getHistory() {
        return history;
    }

    public void setHistory(String history) {
        this.history = history;
    }

    public User getDoctor() {
        return doctor;
    }

    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }
    // @Column(name = "prescribed_medicine")
    // private String prescribedMedicine;

    //  public String getPrescribedMedicine() {
    //    return prescribedMedicine;
    //   }

    //  public void setPrescribedMedicine(String prescribedMedicine) {
    //     this.prescribedMedicine = prescribedMedicine;
    // }


    // @Column(name = "treatment_effect", length = 2000)
    // private String treatmentEffect;

    //  public String getTreatmentEffect() {
    //     return treatmentEffect;
    //  }

    //  public void setTreatmentEffect(String treatmentEffect) {
    //      this.treatmentEffect = treatmentEffect;
    //   }

    //@OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonBackReference // Prevent infinite recursion here
    private List<Visit> visits;  // List of visits for this patient


    public List<Visit> getVisits() {
        return visits;
    }

    public void setVisits(List<Visit> visits) {
        this.visits = visits;
    }


}