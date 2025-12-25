package com.example.demo.service;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.repository.DirectoryEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;

@Service
public class DirectoryService {

    private final DirectoryEntryRepository repository;

    public DirectoryService(DirectoryEntryRepository repository) {
        this.repository = repository;
    }

    public List<DirectoryEntry> getAll() {
        return repository.findAll();
    }

    public List<DirectoryEntry> getLawyers() {
        return repository.findByType("LAWYER");
    }

    public List<DirectoryEntry> getNGOs() {
        return repository.findByType("NGO");
    }

    public void importFromCsv(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            br.readLine(); // skip header

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");

                DirectoryEntry d = new DirectoryEntry();
                d.setName(data[0]);
                d.setType("NGO");
                d.setState(data[1]);
                d.setCity(data[2]);
                d.setSpecialization(data[3]);
                d.setContactPhone(data[4]);
                d.setSource("NGO_DARPAN");
                d.setVerified(false);

                repository.save(d);
            }

        } catch (Exception e) {
            throw new RuntimeException("CSV import failed", e);
        }
    }
}
