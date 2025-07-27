package com.example.demo.repository;

import com.example.demo.model.Doctor;
import com.example.demo.model.PharmaceuticalCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface PharmaceuticalCompanyRepository extends JpaRepository<PharmaceuticalCompany, Long> {
    Optional<PharmaceuticalCompany> findByUser_Email(String email);
    Optional<Doctor> findByUserContactInfo(String contactInfo);
    Optional<PharmaceuticalCompany> findPharmaceuticalCompanyById(Long id);
}