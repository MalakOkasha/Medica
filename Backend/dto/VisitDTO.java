package com.example.demo.dto;

public class VisitDTO {
    private Long id;
    private Long patientId;  // Only store the ID of the patient
    private Long doctorId;   // Only store the ID of the doctor
    private String visitDate;  // Only store the visit date as String

    // New fields for diagnosis, symptoms, prescribed medicine, and treatment effect
    private String diagnosis;
    private String symptoms;
    private String prescribedMedicine;
    private String treatmentEffect;

    // Constructor with new fields
    public VisitDTO(Long id, Long patientId, Long doctorId, String visitDate, String diagnosis, String symptoms, String prescribedMedicine, String treatmentEffect) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.visitDate = visitDate;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.prescribedMedicine = prescribedMedicine;
        this.treatmentEffect = treatmentEffect;
    }

    // No-argument constructor required for Jackson deserialization
    public VisitDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(String visitDate) {
        this.visitDate = visitDate;
    }

    // Getters and Setters for new fields
    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getPrescribedMedicine() {
        return prescribedMedicine;
    }

    public void setPrescribedMedicine(String prescribedMedicine) {
        this.prescribedMedicine = prescribedMedicine;
    }

    public String getTreatmentEffect() {
        return treatmentEffect;
    }

    public void setTreatmentEffect(String treatmentEffect) {
        this.treatmentEffect = treatmentEffect;
    }
}
