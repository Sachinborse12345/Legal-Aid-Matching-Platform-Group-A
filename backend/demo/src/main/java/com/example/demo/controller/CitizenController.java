package com.example.demo.controller;

import com.example.demo.repository.CitizenRepository;
import com.example.demo.entity.Citizen;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citizens")

public class CitizenController {

    private final CitizenRepository repo;
    private final com.example.demo.service.EmailService emailService;
    private final com.example.demo.service.AuditLogService auditLogService;

    public CitizenController(CitizenRepository repo, com.example.demo.service.EmailService emailService, com.example.demo.service.AuditLogService auditLogService) {
        this.repo = repo;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
    }

    // GET → /citizens
    @GetMapping
    public List<Citizen> getAll() {
        return repo.findAll();
    }

    // POST → /citizens/add (must come before /{id} to avoid path conflict)
    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addCitizen(@RequestBody Map<String, Object> requestData, jakarta.servlet.http.HttpServletRequest request) {
        try {
            System.out.println("DEBUG: addCitizen payload: " + requestData);
            // Validate required fields
            if (requestData.get("email") == null || requestData.get("email").toString().trim().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email is required");
            }

            if (requestData.get("aadharNum") == null || requestData.get("aadharNum").toString().trim().isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Aadhar number is required");
            }

            // EMAIL already exists?
            if (repo.existsByEmail(requestData.get("email").toString())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email already exists");
            }

            // AADHAR already exists?
            if (repo.existsByAadharNum(requestData.get("aadharNum").toString())) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Aadhar number already exists");
            }

            // Create new Citizen entity
            Citizen c = new Citizen();

            // Set basic fields
            c.setFullName(requestData.get("fullName") != null ? requestData.get("fullName").toString() : "");
            c.setAadharNum(requestData.get("aadharNum").toString());
            c.setEmail(requestData.get("email").toString());
            c.setMobileNum(requestData.get("mobileNum") != null ? requestData.get("mobileNum").toString() : "");
            c.setPassword(requestData.get("password") != null ? requestData.get("password").toString() : "");

            // Parse date of birth
            if (requestData.get("dateOfBirth") != null) {
                try {
                    String dobStr = requestData.get("dateOfBirth").toString();
                    LocalDate dob = LocalDate.parse(dobStr);
                    c.setDateOfBirth(dob);
                } catch (Exception e) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Invalid date format. Use YYYY-MM-DD");
                }
            } else {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Date of birth is required");
            }

            // Set location fields (with empty string defaults if null)
            String state = requestData.get("state") != null ? requestData.get("state").toString().trim() : "";
            String district = requestData.get("district") != null ? requestData.get("district").toString().trim() : "";
            String city = requestData.get("city") != null ? requestData.get("city").toString().trim() : "";
            String address = requestData.get("address") != null ? requestData.get("address").toString().trim() : "";

            // Validate location fields
            if (state.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("State is required");
            }
            if (district.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("District is required");
            }
            if (city.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("City is required");
            }
            if (address.isEmpty()) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Address is required");
            }

            c.setState(state);
            c.setDistrict(district);
            c.setCity(city);
            c.setAddress(address);

            // SAVE citizen
            Citizen saved = repo.save(c);

            // Send Welcome Email
            try {
                emailService.sendWelcomeEmail(saved.getEmail(), "CITIZEN", saved.getFullName());
            } catch (Exception e) {
                System.err.println("Failed to send welcome email: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Citizen registered successfully");
            response.put("data", saved);

            // Log Audit
            String ip = request.getRemoteAddr();
            auditLogService.logAction(
                saved.getEmail(), 
                "CITIZEN",
                "Created Account",
                "Citizen Registration",
                "New citizen registered: " + saved.getEmail(),
                ip
            );

            return ResponseEntity.ok(response);

        } catch (org.hibernate.exception.SQLGrammarException e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Database schema error. Please restart the Spring Boot application to update the database schema. Error: "
                            + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " | Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving citizen: " + errorMessage);
        }
    }

    // GET → /citizens/{id} (must come after /add to avoid path conflict)
    @GetMapping("/{id}")
    public ResponseEntity<?> getCitizenById(@PathVariable Integer id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
