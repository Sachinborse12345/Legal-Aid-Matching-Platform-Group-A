package com.example.demo.service;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.repository.DirectoryEntryRepository;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Service
public class NGODarpanImportService {

    private final DirectoryEntryRepository repository;

    public NGODarpanImportService(DirectoryEntryRepository repository) {
        this.repository = repository;
    }

    public void importCSV(String fileName) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(
                        getClass().getClassLoader().getResourceAsStream(fileName)
                )
        )) {
            String line;
            br.readLine(); // skip header

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");

                DirectoryEntry d = new DirectoryEntry();
                d.setName(data[0]);
                d.setType("NGO");
                d.setState(data[1]);
                d.setState(data[2]);
                d.setSpecialization(data[3]);
                d.setContactPhone(data[4]);
                d.setVerified(true);           // ✅ BLUE TICK
                d.setSource("NGO_DARPAN");

                repository.save(d);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to import NGO CSV", e);
        }
    }
}
