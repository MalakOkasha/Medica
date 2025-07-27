package com.example.demo.repository;

import com.example.demo.model.Favorites;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoritesRepository extends JpaRepository<Favorites, Long> {
    Favorites findByDoctorIdAndCompanyId(Long doctorId, Long companyId);
}
