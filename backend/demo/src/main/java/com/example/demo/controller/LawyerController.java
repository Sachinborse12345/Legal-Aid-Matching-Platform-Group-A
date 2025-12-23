package com.example.demo.controller;

import com.example.demo.entity.Lawyer;
import com.example.demo.repository.LawyerRepository;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.LawyerImportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lawyers")
public class LawyerController {

    private final LawyerRepository lawyerRepository;
    private final CloudinaryService cloudinaryService;
    private final LawyerImportService lawyerImportService;

    public LawyerController(
            LawyerRepository lawyerRepository,
            CloudinaryService cloudinaryService,
            LawyerImportService lawyerImportService
    ) {
        this.lawyerRepository = lawyerRepository;
        this.cloudinaryService = cloudinaryService;
        this.lawyerImportService = lawyerImportService;
    }

    // ===============================
    // GET ALL LAWYERS
    // GET → /api/lawyers
    // ===============================
    @GetMapping
    public List<Lawyer> getAllLawyers() {
        return lawyerRepository.findAll();
    }

    // ===============================
    // GET LAWYER BY ID (TASK-3)
    // GET → /api/lawyers/{id}
    // ===============================
    @GetMapping("/{id}")
    public ResponseEntity<Lawyer> getLawyerById(@PathVariable Integer id) {
        return lawyerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ===============================
    // SEARCH LAWYERS (TASK-2)
    // GET → /api/lawyers/search?city=Pune&specialization=Criminal
    // ===============================
    @GetMapping("/search")
    public List<Lawyer> searchLawyers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization
    ) {
        if (city != null && specialization != null) {
            return lawyerRepository.findByCityAndSpecialization(city, specialization);
        }
        if (city != null) {
            return lawyerRepository.findByCity(city);
        }
        if (specialization != null) {
            return lawyerRepository.findBySpecialization(specialization);
        }
        return lawyerRepository.findAll();
    }

    // ===============================
    // ADD LAWYER MANUALLY
    // POST → /api/lawyers/add
    // ===============================
    @PostMapping("/add")
    public ResponseEntity<?> addLawyer(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("aadhar") String aadhar,
            @RequestParam(value = "aadharProof", required = false) MultipartFile aadharProof,
            @RequestParam("barId") String barId,
            @RequestParam("barState") String barState,
            @RequestParam("specialization") String specialization,
            @RequestParam(value = "barCert", required = false) MultipartFile barCert,
            @RequestParam("experience") String experience,
            @RequestParam("address") String address,
            @RequestParam("district") String district,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam(value = "latitude", required = false) String latitude,
            @RequestParam(value = "longitude", required = false) String longitude,
            @RequestParam("password") String password
    ) {
        try {
            if (lawyerRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            if (lawyerRepository.existsByAadharNum(aadhar)) {
                return ResponseEntity.badRequest().body("Aadhar number already exists");
            }
            if (lawyerRepository.existsByBarCouncilId(barId)) {
                return ResponseEntity.badRequest().body("Bar Council ID already exists");
            }

            Lawyer lawyer = new Lawyer();
            lawyer.setFullName(fullName);
            lawyer.setEmail(email);
            lawyer.setMobileNum(phone);
            lawyer.setAadharNum(aadhar);
            lawyer.setBarCouncilId(barId);
            lawyer.setBarState(barState);
            lawyer.setSpecialization(specialization);
            lawyer.setExperienceYears(Integer.parseInt(experience));
            lawyer.setAddress(address);
            lawyer.setDistrict(district);
            lawyer.setCity(city);
            lawyer.setState(state);
            lawyer.setPassword(password);

            if (latitude != null && !latitude.isEmpty()) {
                lawyer.setLatitude(Double.parseDouble(latitude));
            }
            if (longitude != null && !longitude.isEmpty()) {
                lawyer.setLongitude(Double.parseDouble(longitude));
            }

            if (aadharProof != null && !aadharProof.isEmpty()) {
                String url = cloudinaryService.uploadFile(aadharProof, "lawyers/aadhar-proof");
                lawyer.setAadharProofUrl(url);
                lawyer.setAadharProofFilename(aadharProof.getOriginalFilename());
            }

            if (barCert != null && !barCert.isEmpty()) {
                String url = cloudinaryService.uploadFile(barCert, "lawyers/bar-certificates");
                lawyer.setBarCertificateUrl(url);
                lawyer.setBarCertificateFilename(barCert.getOriginalFilename());
            }

            return ResponseEntity.ok(lawyerRepository.save(lawyer));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving lawyer: " + e.getMessage());
        }
    }

    // ===============================
    // CSV IMPORT (TASK-1)
    // POST → /api/lawyers/admin/import-lawyers
    // ===============================
    @PostMapping("/admin/import-lawyers")
    public ResponseEntity<String> importLawyersFromCSV(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        lawyerImportService.importFromCSV(file);
        return ResponseEntity.ok("Lawyers imported successfully");
    }
}
