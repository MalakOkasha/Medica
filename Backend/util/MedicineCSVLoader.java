package com.example.demo.util;

import com.example.demo.model.Medicine;
import com.example.demo.repository.MedicineRepository;
import com.opencsv.CSVReader;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;

@Component
public class MedicineCSVLoader {

    @Autowired
    private MedicineRepository medicineRepository;

    @PostConstruct
    public void loadMedicines() {
        try {
            if (medicineRepository.count() > 0) {
                return; // Prevents duplicate loading
            }

            Reader reader = new InputStreamReader(getClass().getResourceAsStream("/medicine_dataset.csv"));
            CSVReader csvReader = new CSVReader(reader);

            List<String[]> records = csvReader.readAll();
            records.remove(0); // Remove header

            for (String[] row : records) {
                Medicine med = new Medicine();

                med.setName(row[1]);
                med.setSubstitute0(row[2].isEmpty() ? null : row[2]);
                med.setSubstitute1(row[3].isEmpty() ? null : row[3]);

                med.setSideeffect0(row[4].isEmpty() ? null : row[4]);
                med.setSideeffect1(row[5].isEmpty() ? null : row[5]);
                med.setSideeffect2(row[6].isEmpty() ? null : row[6]);

                med.setUse0(row[7].isEmpty() ? null : row[7]);
                med.setUse1(row.length > 8 && !row[8].isEmpty() ? row[8] : null);
                med.setUse2(row.length > 9 && !row[9].isEmpty() ? row[9] : null);

                medicineRepository.save(med);
            }

            csvReader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
