package com.example.demo.service;

import com.example.demo.entity.Lawyer;
import com.example.demo.repository.LawyerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class LawyerImportService {

    private final LawyerRepository lawyerRepository;

    public LawyerImportService(LawyerRepository lawyerRepository) {
        this.lawyerRepository = lawyerRepository;
    }

    public void importFromCSV(MultipartFile file) throws Exception {

        BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream())
        );

        String line;
        br.readLine(); // skip header

        while ((line = br.readLine()) != null) {

            String[] data = line.split(",");

            if (lawyerRepository.existsByEmail(data[1])) {
                continue;
            }

            Lawyer lawyer = new Lawyer();
            lawyer.setFullName(data[0]);
            lawyer.setEmail(data[1]);
            lawyer.setMobileNum(data[2]);
            lawyer.setAadharNum(data[3]);
            lawyer.setBarCouncilId(data[4]);
            lawyer.setBarState(data[5]);
            lawyer.setSpecialization(data[6]);
            lawyer.setExperienceYears(Integer.parseInt(data[7]));
            lawyer.setAddress(data[8]);
            lawyer.setDistrict(data[9]);
            lawyer.setCity(data[10]);
            lawyer.setState(data[11]);

            lawyer.setPassword("Temp@123");

            lawyerRepository.save(lawyer);
        }
    }
}
