package com.example.demo.service;

import com.example.demo.dto.AddMedicineRequest;
import com.example.demo.dto.UpdateMedicineRequest;
import com.example.demo.model.Medicine;
import com.example.demo.model.PharmaceuticalCompany;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.repository.PharmaceuticalCompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private PharmaceuticalCompanyRepository companyRepository;

    public Optional<Medicine> findByName(String name) {
        return medicineRepository.findByName(name);
    }

    public void save(Medicine medicine) {
        medicineRepository.save(medicine);
    }

    public long count() {
        return medicineRepository.count();
    }
    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public Medicine addMedicine(AddMedicineRequest request) {
        // 1) Validate required fields
        if (isNullOrEmpty(request.getName()) ||
                isNullOrEmpty(request.getSubstitute0()) ||
                isNullOrEmpty(request.getSubstitute1()) ||
                isNullOrEmpty(request.getUse0()) ||
                isNullOrEmpty(request.getUse1()) ||
                isNullOrEmpty(request.getUse2()) ||
                isNullOrEmpty(request.getSideeffect0()) ||
                isNullOrEmpty(request.getSideeffect1()) ||
                isNullOrEmpty(request.getSideeffect2())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields."
            );
        }

        // 2) Load and validate company
        PharmaceuticalCompany company = companyRepository
                .findById(request.getCompanyId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pharmaceutical company not found."
                ));

        String name = request.getName().trim();

        // 3) Prevent any *other* company (or system) from owning this name
        //    - if it exists under a different company → CONFLICT
        if (medicineRepository.existsByNameIgnoreCaseAndCompany_IdNot(name, request.getCompanyId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This medicine is already added by another company."
            );
        }

        // 4) If the same company already added it → CONFLICT
        List<Medicine> already = medicineRepository.findByNameIgnoreCase(name);
        for (Medicine m : already) {
            if (m.getCompany()!=null && m.getCompany().getId().equals(request.getCompanyId())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Your company has already added this medicine."
                );
            }
            // if there's a record with company == null, treat as system-owned duplicates
            if (m.getCompany()==null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This medicine already exists in the application dataset."
                );
            }
        }

        // 5) All clear—create and save
        Medicine medicine = new Medicine();
        medicine.setName(name);
        medicine.setSubstitute0(request.getSubstitute0().trim());
        medicine.setSubstitute1(request.getSubstitute1().trim());
        medicine.setUse0(request.getUse0().trim());
        medicine.setUse1(request.getUse1().trim());
        medicine.setUse2(request.getUse2().trim());
        medicine.setSideeffect0(request.getSideeffect0().trim());
        medicine.setSideeffect1(request.getSideeffect1().trim());
        medicine.setSideeffect2(request.getSideeffect2().trim());
        medicine.setCompany(company);

        return medicineRepository.save(medicine);
    }




    public String deleteMedicine(Long companyId, Long medicineId) {
        Optional<Medicine> medicineOpt = medicineRepository.findById(medicineId);

        if (medicineOpt.isEmpty()) {
            return "Medicine not found.";
        }

        Medicine medicine = medicineOpt.get();

        // Check if the medicine has no company (e.g., system/default data)
        if (medicine.getCompany() == null) {
            return "You do not have the privilege to delete this medicine. It belongs to the application.";
        }

        // Check if the medicine belongs to the requesting company
        if (!medicine.getCompany().getId().equals(companyId)) {
            throw new SecurityException("You are not authorized to delete this medicine.");
        }

        medicineRepository.deleteById(medicineId);
        return "Medicine deleted successfully.";
    }
    public String updateMedicine(Long companyId, Long medicineId, UpdateMedicineRequest request) {
        // 1) Load existing medicine
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Medicine not found."
                ));

        // 2) Ownership checks
        if (medicine.getCompany() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have the privilege to update this medicine. It belongs to the app."
            );
        }
        if (!medicine.getCompany().getId().equals(companyId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have the privilege to update this medicine. It belongs to another company."
            );
        }

        // 3) Validate required fields
        if (isBlank(request.getName()) ||
                isBlank(request.getSubstitute0()) ||
                isBlank(request.getSubstitute1()) ||
                isBlank(request.getUse0()) ||
                isBlank(request.getUse1()) ||
                isBlank(request.getUse2()) ||
                isBlank(request.getSideeffect0()) ||
                isBlank(request.getSideeffect1()) ||
                isBlank(request.getSideeffect2())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields before updating."
            );
        }

        // 4) Check name‐change duplicates
        String newName = request.getName().trim();
        if (!newName.equalsIgnoreCase(medicine.getName())) {
            // 4a) system‐owned duplicate?
            boolean appDuplicate = medicineRepository.existsByNameIgnoreCaseAndCompany_IdNot(newName, companyId);
            if (appDuplicate) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This medicine is already added by another company or the application."
                );
            }
            // 4b) same‐company duplicate?
            // (rare if you changed case only, but for consistency)
            List<Medicine> sameName = medicineRepository.findByNameIgnoreCase(newName);
            for (Medicine m : sameName) {
                if (m.getCompany() != null && m.getCompany().getId().equals(companyId)) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Your company has already added a medicine with that name."
                    );
                }
            }
            medicine.setName(newName);
        }

        // 5) Copy other fields if changed
        boolean changed = false;
        if (!request.getSubstitute0().equals(medicine.getSubstitute0())) {
            medicine.setSubstitute0(request.getSubstitute0().trim());
            changed = true;
        }
        if (!request.getSubstitute1().equals(medicine.getSubstitute1())) {
            medicine.setSubstitute1(request.getSubstitute1().trim());
            changed = true;
        }
        if (!request.getUse0().equals(medicine.getUse0())) {
            medicine.setUse0(request.getUse0().trim());
            changed = true;
        }
        if (!request.getUse1().equals(medicine.getUse1())) {
            medicine.setUse1(request.getUse1().trim());
            changed = true;
        }
        if (!request.getUse2().equals(medicine.getUse2())) {
            medicine.setUse2(request.getUse2().trim());
            changed = true;
        }
        if (!request.getSideeffect0().equals(medicine.getSideeffect0())) {
            medicine.setSideeffect0(request.getSideeffect0().trim());
            changed = true;
        }
        if (!request.getSideeffect1().equals(medicine.getSideeffect1())) {
            medicine.setSideeffect1(request.getSideeffect1().trim());
            changed = true;
        }
        if (!request.getSideeffect2().equals(medicine.getSideeffect2())) {
            medicine.setSideeffect2(request.getSideeffect2().trim());
            changed = true;
        }

        if (!changed && newName.equalsIgnoreCase(medicine.getName())) {
            return "You did not change anything.";
        }

        // 6) Persist
        medicineRepository.save(medicine);
        return "Medicine updated successfully.";
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }


    public String processMedicineDataset(MultipartFile file, Long companyId) throws IOException {
        Optional<PharmaceuticalCompany> companyOpt = companyRepository.findById(companyId);
        if (companyOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid company ID.");
        }

        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;
        int insertedCount = 0;
        int appOwnedDuplicates = 0;
        int otherCompanyDuplicates = 0;
        int yourCompanyDuplicates = 0;

        List<String> appOwnedNames = new ArrayList<>();
        List<String> otherCompanyNames = new ArrayList<>();
        List<String> yourCompanyNames = new ArrayList<>();

        reader.readLine(); // Skip header

        while ((line = reader.readLine()) != null) {
            String[] fields = line.split(",");

            if (fields.length < 9) continue;

            String name = fields[0].trim();
            List<Medicine> existingOpt = medicineRepository.findByNameIgnoreCase(name);

            if (!existingOpt.isEmpty()) {
                Medicine existing = existingOpt.get(0);
                if (existing.getCompany() == null) {
                    appOwnedDuplicates++;
                    appOwnedNames.add(name);
                } else if (!existing.getCompany().getId().equals(companyId)) {
                    otherCompanyDuplicates++;
                    otherCompanyNames.add(name);
                } else {
                    yourCompanyDuplicates++;
                    yourCompanyNames.add(name);
                }
                continue;
            }

            Medicine med = new Medicine();
            med.setName(name);
            med.setSubstitute0(fields[1].trim());
            med.setSubstitute1(fields[2].trim());
            med.setUse0(fields[3].trim());
            med.setUse1(fields[4].trim());
            med.setUse2(fields[5].trim());
            med.setSideeffect0(fields[6].trim());
            med.setSideeffect1(fields[7].trim());
            med.setSideeffect2(fields[8].trim());
            med.setCompany(companyOpt.get());

            medicineRepository.save(med);
            insertedCount++;
        }

        StringBuilder result = new StringBuilder(insertedCount + " medicines added successfully.");
        if (!yourCompanyNames.isEmpty()) {
            result.append(" ").append(yourCompanyNames.size()).append(" medicines already exist and are owned by your company: ")
                    .append(String.join(", ", yourCompanyNames)).append(".");
        }
        if (!appOwnedNames.isEmpty()) {
            result.append(" ").append(appOwnedNames.size()).append(" medicines already exist in the app (no company): ")
                    .append(String.join(", ", appOwnedNames)).append(".");
        }
        if (!otherCompanyNames.isEmpty()) {
            result.append(" ").append(otherCompanyNames.size()).append(" medicines already exist under another company: ")
                    .append(String.join(", ", otherCompanyNames)).append(".");
        }

        return result.toString();
    }


    public List<Medicine> getMedicinesByCompanyId(Long companyId) {
        return medicineRepository.findAllByCompany_Id(companyId);
    }

    public Optional<Medicine> getMedicineByCompanyAndId(Long companyId, Long medicineId) {
        return medicineRepository.findByIdAndCompanyId(medicineId, companyId);
    }




}