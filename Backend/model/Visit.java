package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "visits")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient; // Each visit is linked to a patient

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id") // Adding the doctor relationship
    private Doctor doctor; // Each visit is also linked to a doctor

    @Temporal(TemporalType.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date visitDate; // Only the visit date

    // Constructors, Getters, and Setters
    private String diagnosis;
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    private String symptoms;
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    @Column(name = "prescribed_medicine")
    private String prescribedMedicine;
    public String getPrescribedMedicine() {
        return prescribedMedicine;
    }

    public void setPrescribedMedicine(String prescribedMedicine) {
        this.prescribedMedicine = prescribedMedicine;
    }
    @Column(name = "treatment_effect", length = 2000)
    private String treatmentEffect;

    public String getTreatmentEffect() {
        return treatmentEffect;
    }

    public void setTreatmentEffect(String treatmentEffect) {
        this.treatmentEffect = treatmentEffect;
    }
    public Visit() {}

    public Visit(Patient patient, Doctor doctor, Date visitDate ,String diagnosis , String symptoms) {
        this.patient = patient;
        this.doctor = doctor;
        this.visitDate = visitDate;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Date getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(Date visitDate) {
        this.visitDate = visitDate;
    }
}
