package com.example.demo.dto;

public class AddMedicineRequest {

    private String name;
    private String substitute0;
    private String substitute1;

    private String use0;
    private String use1;
    private String use2;

    private String sideeffect0;
    private String sideeffect1;
    private String sideeffect2;

    private Long companyId; // ID of the pharmaceutical company adding the medicine

    // Constructors
    public AddMedicineRequest() {}

    public AddMedicineRequest(String name, String substitute0, String substitute1, String use0, String use1, String use2,
                              String sideeffect0, String sideeffect1, String sideeffect2, Long companyId) {
        this.name = name;
        this.substitute0 = substitute0;
        this.substitute1 = substitute1;
        this.use0 = use0;
        this.use1 = use1;
        this.use2 = use2;
        this.sideeffect0 = sideeffect0;
        this.sideeffect1 = sideeffect1;
        this.sideeffect2 = sideeffect2;
        this.companyId = companyId;
    }

    // Getters and Setters

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

    public String getSideeffect0() {
        return sideeffect0;
    }

    public void setSideeffect0(String sideeffect0) {
        this.sideeffect0 = sideeffect0;
    }

    public String getSideeffect1() {
        return sideeffect1;
    }

    public void setSideeffect1(String sideeffect1) {
        this.sideeffect1 = sideeffect1;
    }

    public String getSideeffect2() {
        return sideeffect2;
    }

    public void setSideeffect2(String sideeffect2) {
        this.sideeffect2 = sideeffect2;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }
}
