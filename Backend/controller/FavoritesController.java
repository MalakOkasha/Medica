package com.example.demo.controller;

import com.example.demo.model.Favorites;
import com.example.demo.repository.FavoritesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorites")
public class FavoritesController {

    @Autowired
    private FavoritesRepository favoriteCompanyRepository;

    // Add to favorites
    @PostMapping("/add/{doctorId}/{companyId}")
    public String addToFavorites(@PathVariable Long doctorId, @PathVariable Long companyId) {
        Favorites favorite = new Favorites(companyId, doctorId);
        favoriteCompanyRepository.save(favorite);
        return "Added to favorites successfully.";
    }

    // Remove from favorites
    @DeleteMapping("/remove/{doctorId}/{companyId}")
    public String removeFromFavorites(@PathVariable Long doctorId, @PathVariable Long companyId) {
        Favorites favorite = favoriteCompanyRepository.findByDoctorIdAndCompanyId(doctorId, companyId);
        if (favorite != null) {
            favoriteCompanyRepository.delete(favorite);
            return "Removed from favorites successfully.";
        } else {
            return "Favorite not found.";
        }
    }

    @GetMapping("/exists/{doctorId}/{companyId}")
    public boolean isFavorite(@PathVariable Long doctorId, @PathVariable Long companyId) {
        Favorites favorite = favoriteCompanyRepository.findByDoctorIdAndCompanyId(doctorId, companyId);
        return favorite != null;
    }
}
