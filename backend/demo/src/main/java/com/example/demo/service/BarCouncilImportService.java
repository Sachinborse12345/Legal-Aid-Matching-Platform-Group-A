package com.example.demo.service;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.repository.DirectoryEntryRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class BarCouncilImportService {

    private final DirectoryEntryRepository directoryEntryRepository;
    private final com.example.demo.repository.LawyerRepository lawyerRepository;

    public BarCouncilImportService(DirectoryEntryRepository directoryEntryRepository,
            com.example.demo.repository.LawyerRepository lawyerRepository) {
        this.directoryEntryRepository = directoryEntryRepository;
        this.lawyerRepository = lawyerRepository;
    }

    /**
     * Import Lawyers from a CSV file on the classpath (simulating Bar Council DB).
     * Expected header:
     * barCouncilId,name,state,district,specialization,year
     */
    public void importCSV(String filename) {
        try {
            ClassPathResource resource = new ClassPathResource(filename);

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                String line;
                boolean first = true;

                while ((line = reader.readLine()) != null) {
                    // skip header
                    if (first) {
                        first = false;
                        continue;
                    }

                    if (line.isBlank()) {
                        continue;
                    }

                    String[] parts = line.split(",", -1);

                    // Guard if the row is shorter than expected
                    if (parts.length < 5) {
                        continue;
                    }

                    String barCouncilId = parts[0].trim().toUpperCase();
                    String name = parts[1].trim();
                    String state = parts[2].trim();
                    String district = parts[3].trim();
                    String specialization = parts[4].trim();
                    // year is parts[5] if needed

                    // Update existing or create new
                    DirectoryEntry entry = directoryEntryRepository.findByTypeAndBarCouncilId("LAWYER", barCouncilId);
                    if (entry == null) {
                        entry = new DirectoryEntry();
                        entry.setType("LAWYER");
                        entry.setBarCouncilId(barCouncilId);
                    }

                    entry.setSource("BAR_COUNCIL");
                    entry.setName(name);
                    entry.setState(state);
                    entry.setDistrict(district);
                    entry.setSpecialization(specialization);
                    entry.setVerified(true);
                    entry.setApproved(true);

                    directoryEntryRepository.save(entry);

                    // Update existing lawyers who match this ID
                    java.util.List<com.example.demo.entity.Lawyer> matchingLawyers = lawyerRepository.findAll();
                    // Inefficient but safe for now - better to have findByBarCouncilId in repo
                    // Assuming findAll is okay for small demo
                    for (com.example.demo.entity.Lawyer lawyer : matchingLawyers) {
                        if (barCouncilId.equalsIgnoreCase(lawyer.getBarCouncilId())) {
                            lawyer.setVerificationStatus(true);
                            lawyerRepository.save(lawyer);
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to import Bar Council CSV", e);
        }
    }
}
