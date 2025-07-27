package com.example.demo.repository;

import com.example.demo.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByNameIgnoreCase(String name);
    Optional<Medicine> findByName(String name);
    List<Medicine> findAllByCompany_Id(Long companyId);
    Optional<Medicine> findByIdAndCompanyId(Long id, Long companyId);
    List<Medicine> findTop10ByNameStartingWithIgnoreCase(String name);


    @Query("SELECT m FROM Medicine m WHERE LOWER(m.name) LIKE LOWER(CONCAT(:prefix, '%'))")
    List<Medicine> searchByNamePrefix(@Param("prefix") String prefix);

    boolean existsByNameIgnoreCaseAndCompany_IdNot(String name, Long companyId);
}
