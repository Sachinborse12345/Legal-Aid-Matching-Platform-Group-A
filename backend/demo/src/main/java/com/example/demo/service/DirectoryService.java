package com.example.demo.service;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.repository.DirectoryEntryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    public void uploadFile(MultipartFile file) {

        String filename = file.getOriginalFilename();

        if (filename.endsWith(".csv")) {
            readCSV(file);
        } else if (filename.endsWith(".json")) {
            readJSON(file);
        } else {
            throw new RuntimeException("Only CSV or JSON allowed");
        }
    }

    private void readCSV(MultipartFile file) {
        try (BufferedReader br =
                     new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            String line;
            br.readLine(); // skip header

            while ((line = br.readLine()) != null) {
                String[] data = line.split(",");

                DirectoryEntry d = new DirectoryEntry();
                d.setName(data[0]);
                d.setType(data[1]);           // NGO / LAWYER
                d.setSpecialization(data[2]);
                d.setState(data[3]);
                d.setDistrict(data[4]);
                d.setContactPhone(data[5]);
                d.setSource("INTERNAL");

                repository.save(d);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void readJSON(MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<DirectoryEntry> list =
                    Arrays.asList(mapper.readValue(file.getBytes(), DirectoryEntry[].class));
            repository.saveAll(list);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
