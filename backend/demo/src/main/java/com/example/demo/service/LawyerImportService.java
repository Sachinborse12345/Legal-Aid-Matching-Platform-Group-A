package com.example.demo.service;

import com.example.demo.entity.Lawyer;
import com.example.demo.repository.DirectoryEntryRepository;
import com.example.demo.repository.LawyerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class LawyerImportService {

    private final LawyerRepository lawyerRepository;
    private final DirectoryEntryRepository directoryEntryRepository;

    public LawyerImportService(LawyerRepository lawyerRepository,
                               DirectoryEntryRepository directoryEntryRepository) {
        this.lawyerRepository = lawyerRepository;
        this.directoryEntryRepository = directoryEntryRepository;
    }

    public void importFromCSV(MultipartFile file) throws Exception {

        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line = br.readLine(); // skip header
            if (line == null) {
                return;
            }

            while ((line = br.readLine()) != null) {

                String[] data = line.split(",", -1);

                // 0 fullName, 1 email, 2 mobile, 3 aadhar, 4 barCouncilId,
                // 5 barState, 6 specialization, 7 experienceYears,
                // 8 address, 9 district, 10 city, 11 state
                if (data.length < 12) {
                    continue;
                }

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

                // verification against directory_entries
                boolean verifiedInDirectory =
                        directoryEntryRepository.existsByTypeAndBarCouncilId(
                                "LAWYER",
                                lawyer.getBarCouncilId()
                        );
                lawyer.setVerificationStatus(verifiedInDirectory);

                lawyerRepository.save(lawyer);
            }
        }
    }
}
