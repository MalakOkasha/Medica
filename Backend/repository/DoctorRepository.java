package com.example.demo.repository;

import com.example.demo.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // Query the contactInfo from the associated User entity
    Optional<Doctor> findByUserContactInfo(String contactInfo);
}
