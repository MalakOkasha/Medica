package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "drug_interactions", uniqueConstraints = @UniqueConstraint(columnNames = {"drug1", "drug2"}))
public class DrugInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String drug1;
    private String drug2;

    @Column(columnDefinition = "TEXT")
   // @Column(length = 2000)
    private String interactionDescription;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDrug1() { return drug1; }
    public void setDrug1(String drug1) { this.drug1 = drug1; }

    public String getDrug2() { return drug2; }
    public void setDrug2(String drug2) { this.drug2 = drug2; }

    public String getInteractionDescription() { return interactionDescription; }
    public void setInteractionDescription(String interactionDescription) {
        this.interactionDescription = interactionDescription;
    }
}
