package com.example.demo.controller;

import com.example.demo.entity.Citizen;
import com.example.demo.entity.Lawyer;
import com.example.demo.entity.NGO;
import com.example.demo.entity.Admin;
import com.example.demo.repository.CitizenRepository;
import com.example.demo.repository.LawyerRepository;
import com.example.demo.repository.NGORepository;
import com.example.demo.repository.AdminRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final CitizenRepository citizenRepo;
    private final LawyerRepository lawyerRepo;
    private final NGORepository ngoRepo;
    private final AdminRepository adminRepo;
    private final JwtUtil jwtUtil;

    public AuthController(
            CitizenRepository citizenRepo,
            LawyerRepository lawyerRepo,
            NGORepository ngoRepo,
            AdminRepository adminRepo,
            JwtUtil jwtUtil) {
        this.citizenRepo = citizenRepo;
        this.lawyerRepo = lawyerRepo;
        this.ngoRepo = ngoRepo;
        this.adminRepo = adminRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("username"); // Frontend sends "username" but it's email
            String password = loginRequest.get("password");
            String role = loginRequest.get("role");

            if (email == null || password == null || role == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email, password, and role are required");
            }

            Object user = null;
            String username = "";
            Integer userId = null;

            // Find user based on role
            switch (role.toUpperCase()) {
                case "CITIZEN":
                    Citizen citizen = citizenRepo.findByEmail(email);
                    if (citizen == null) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    if (!citizen.getPassword().equals(password)) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    user = citizen;
                    username = citizen.getFullName();
                    userId = citizen.getId();
                    break;

                case "LAWYER":
                    Lawyer lawyer = lawyerRepo.findByEmail(email);
                    if (lawyer == null) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    if (!lawyer.getPassword().equals(password)) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    user = lawyer;
                    username = lawyer.getFullName();
                    userId = lawyer.getId();
                    break;

                case "NGO":
                    NGO ngo = ngoRepo.findByEmail(email);
                    if (ngo == null) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    if (!ngo.getPassword().equals(password)) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    user = ngo;
                    username = ngo.getNgoName();
                    userId = ngo.getId();
                    break;

                case "ADMIN":
                    Admin admin = adminRepo.findByEmail(email);
                    if (admin == null) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    if (!admin.getPassword().equals(password)) {
                        return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid email or password");
                    }
                    user = admin;
                    username = admin.getFullName();
                    userId = admin.getId();
                    break;

                default:
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Invalid role. Must be CITIZEN, LAWYER, NGO, or ADMIN");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(email, role.toUpperCase(), username, userId);

            // Prepare response with all user data (excluding password)
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", email);
            response.put("username", username);
            response.put("role", role.toUpperCase());
            response.put("userId", userId);
            response.put("message", "Login successful");

            // Add user-specific data based on role
            Map<String, Object> userData = new HashMap<>();
            String profilePhotoUrl = null;
            switch (role.toUpperCase()) {
                case "CITIZEN":
                    if (user != null) {
                        userData = buildCitizenData((Citizen) user);
                        profilePhotoUrl = ((Citizen) user).getProfilePhotoUrl();
                    }
                    break;
                case "LAWYER":
                    if (user != null) {
                        userData = buildLawyerData((Lawyer) user);
                        profilePhotoUrl = ((Lawyer) user).getProfilePhotoUrl();
                    }
                    break;
                case "NGO":
                    if (user != null) {
                        userData = buildNGOData((NGO) user);
                        profilePhotoUrl = ((NGO) user).getProfilePhotoUrl(); // Extract photoUrl for top-level response
                    }
                    break;
                case "ADMIN":
                    if (user != null) {
                        userData = buildAdminData((Admin) user);
                    }
                    break;
            }
            response.put("userData", userData);
            // Add profilePhotoUrl at top level for easier access (for CITIZEN and LAWYER roles)
            // Always include it, even if null, so frontend can check it
            if (role.toUpperCase().equals("CITIZEN") || role.toUpperCase().equals("LAWYER")) {
                response.put("profilePhotoUrl", profilePhotoUrl);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during login: " + e.getMessage());
        }
    }

    // Helper method to build Citizen data (excluding password)
    private Map<String, Object> buildCitizenData(Citizen citizen) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", citizen.getId());
        data.put("fullName", citizen.getFullName());
        data.put("aadharNum", citizen.getAadharNum());
        data.put("email", citizen.getEmail());
        data.put("mobileNum", citizen.getMobileNum());
        data.put("dateOfBirth", citizen.getDateOfBirth() != null ? citizen.getDateOfBirth().toString() : null);
        data.put("state", citizen.getState());
        data.put("district", citizen.getDistrict());
        data.put("city", citizen.getCity());
        data.put("address", citizen.getAddress());
        data.put("profilePhotoUrl", citizen.getProfilePhotoUrl());
        return data;
    }

    // Helper method to build Lawyer data (excluding password)
    private Map<String, Object> buildLawyerData(Lawyer lawyer) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", lawyer.getId());
        data.put("fullName", lawyer.getFullName());
        data.put("email", lawyer.getEmail());
        data.put("mobileNum", lawyer.getMobileNum());
        data.put("aadharNum", lawyer.getAadharNum());
        data.put("aadharProofUrl", lawyer.getAadharProofUrl());
        data.put("aadharProofFilename", lawyer.getAadharProofFilename());
        data.put("barCouncilId", lawyer.getBarCouncilId());
        data.put("barState", lawyer.getBarState());
        data.put("specialization", lawyer.getSpecialization());
        data.put("barCertificateUrl", lawyer.getBarCertificateUrl());
        data.put("barCertificateFilename", lawyer.getBarCertificateFilename());
        data.put("experienceYears", lawyer.getExperienceYears());
        data.put("address", lawyer.getAddress());
        data.put("district", lawyer.getDistrict());
        data.put("city", lawyer.getCity());
        data.put("state", lawyer.getState());
        data.put("latitude", lawyer.getLatitude());
        data.put("longitude", lawyer.getLongitude());
        data.put("createdAt", lawyer.getCreatedAt() != null ? lawyer.getCreatedAt().toString() : null);
        data.put("profilePhotoUrl", lawyer.getProfilePhotoUrl());
        return data;
    }

    // Helper method to build NGO data (excluding password)
    private Map<String, Object> buildNGOData(NGO ngo) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", ngo.getId());
        data.put("ngoName", ngo.getNgoName());
        data.put("ngoType", ngo.getNgoType());
        data.put("registrationNumber", ngo.getRegistrationNumber());
        data.put("registrationCertificateUrl", ngo.getRegistrationCertificateUrl());
        data.put("registrationCertificateFilename", ngo.getRegistrationCertificateFilename());
        data.put("contact", ngo.getContact());
        data.put("email", ngo.getEmail());
        data.put("address", ngo.getAddress());
        data.put("profilePhotoUrl", ngo.getProfilePhotoUrl());
        data.put("state", ngo.getState());
        data.put("district", ngo.getDistrict());
        data.put("city", ngo.getCity());
        data.put("pincode", ngo.getPincode());
        data.put("latitude", ngo.getLatitude());
        data.put("longitude", ngo.getLongitude());
        data.put("createdAt", ngo.getCreatedAt() != null ? ngo.getCreatedAt().toString() : null);
        return data;
    }

    // Helper method to build Admin data (excluding password)
    private Map<String, Object> buildAdminData(Admin admin) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", admin.getId());
        data.put("fullName", admin.getFullName());
        data.put("aadharNum", admin.getAadharNum());
        data.put("email", admin.getEmail());
        data.put("mobileNum", admin.getMobileNum());
        data.put("dateOfBirth", admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : null);
        data.put("state", admin.getState());
        data.put("district", admin.getDistrict());
        data.put("city", admin.getCity());
        data.put("address", admin.getAddress());
        data.put("profilePhotoUrl", admin.getProfilePhotoUrl());
        data.put("createdAt", admin.getCreatedAt() != null ? admin.getCreatedAt().toString() : null);
        data.put("updatedAt", admin.getUpdatedAt() != null ? admin.getUpdatedAt().toString() : null);
        return data;
    }
}

