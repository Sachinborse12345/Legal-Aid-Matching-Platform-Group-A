package com.example.demo.service;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.repository.DirectoryEntryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;

@Service
public class DirectoryService {

    private final DirectoryEntryRepository repository;

    public DirectoryService(DirectoryEntryRepository repository) {
        this.repository = repository;
    }

    // ---------------- FILE UPLOAD (CSV / JSON) ----------------

    public void uploadFile(MultipartFile file) {

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Filename is missing");
        }

        if (filename.endsWith(".csv")) {
            readCSV(file);
        } else if (filename.endsWith(".json")) {
            readJSON(file);
        } else {
            throw new RuntimeException("Only CSV or JSON allowed");
        }
    }

    private void readCSV(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            String line;
            int row = 0;

            // skip header
            br.readLine();
            row++;

            while ((line = br.readLine()) != null) {
                row++;

                String[] data = line.split(",", -1);
                if (data.length < 6) {
                    continue;
                }

                String name = data[0].trim();
                String type = data[1].trim(); // NGO / LAWYER
                String specialization = data[2].trim();
                String state = data[3].trim();
                String district = data[4].trim();
                String phone = data[5].trim();

                if (name.isEmpty() || type.isEmpty() || state.isEmpty() || district.isEmpty()) {
                    continue;
                }

                DirectoryEntry d = new DirectoryEntry();
                d.setName(name);
                d.setType(type);
                d.setSpecialization(specialization);
                d.setState(state);
                d.setDistrict(district);
                d.setContactPhone(phone);
                d.setSource("INTERNAL");

                repository.save(d);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV", e);
        }
    }

    private void readJSON(MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<DirectoryEntry> list = Arrays.asList(mapper.readValue(file.getBytes(), DirectoryEntry[].class));

            for (DirectoryEntry d : list) {
                if (d.getSource() == null || d.getSource().isBlank()) {
                    d.setSource("INTERNAL");
                }
            }

            repository.saveAll(list);
        } catch (Exception e) {
            throw new RuntimeException("Failed to import JSON", e);
        }
    }

    // ---------------- SEARCH + DETAILS ----------------

    public Page<DirectoryEntry> search(
            String type,
            String name,
            String state,
            String district,
            String specialization,
            Integer minExperience,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Pad wildcards and lower-case in Java to avoid PostgreSQL lower(bytea)
        // conflict
        String namePattern = (name != null) ? "%" + name.trim().toLowerCase() + "%" : null;
        String districtPattern = (district != null) ? "%" + district.trim().toLowerCase() + "%" : null;

        return repository.searchDirectory(
                type,
                namePattern,
                state,
                districtPattern,
                specialization,
                minExperience,
                pageable);
    }

    public long countTotal() {
        return repository.count();
    }

    public DirectoryEntry getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Directory entry not found with id " + id));
    }
}
