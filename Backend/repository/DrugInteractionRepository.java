package com.example.demo.repository;

import com.example.demo.model.DrugInteraction;
import com.example.demo.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrugInteractionRepository extends JpaRepository<DrugInteraction, Long> {
    List<DrugInteraction> findByDrug1IgnoreCaseAndDrug2IgnoreCase(String drug1, String drug2);
    List<DrugInteraction> findByDrug2IgnoreCaseAndDrug1IgnoreCase(String drug2, String drug1);

    @Query("SELECT d FROM DrugInteraction d WHERE LOWER(d.drug1) LIKE LOWER(CONCAT(:prefix, '%')) OR LOWER(d.drug2) LIKE LOWER(CONCAT(:prefix, '%'))")
    List<DrugInteraction> searchByDrugPrefix(@Param("prefix") String prefix);

}
