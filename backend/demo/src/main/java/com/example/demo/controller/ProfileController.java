package com.example.demo.controller;

import com.example.demo.entity.Citizen;
import com.example.demo.entity.Admin;
import com.example.demo.entity.Lawyer;
import com.example.demo.entity.NGO;
import com.example.demo.repository.CitizenRepository;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.LawyerRepository;
import com.example.demo.repository.NGORepository;
import com.example.demo.service.CloudinaryService;
import com.example.demo.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private CitizenRepository citizenRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private LawyerRepository lawyerRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            // Get token from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authorization token required");
            }

            String token = authHeader.substring(7);
            
            // Validate token is not expired
            if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token has expired. Please login again.");
            }
            
            // Extract email from token
            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token");
            }

            // Extract role from token
            String role = jwtUtil.extractRole(token);
            if (role == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Invalid role");
            }
            
            // Validate token with email
            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token");
            }

            // Normalize role to uppercase for case-insensitive comparison
            String normalizedRole = role.toUpperCase();

            Map<String, Object> profileData = new HashMap<>();
            
            if (normalizedRole.equals("CITIZEN")) {
                // Find citizen by email
                Citizen citizen = citizenRepository.findByEmail(email);
                if (citizen == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Citizen profile not found");
                }

                // Map entity to response DTO
                profileData.put("id", citizen.getId());
                profileData.put("fullName", citizen.getFullName());
                profileData.put("shortName", citizen.getFullName() != null && citizen.getFullName().contains(" ") 
                        ? citizen.getFullName().split(" ")[0] + " " + citizen.getFullName().split(" ")[citizen.getFullName().split(" ").length - 1]
                        : citizen.getFullName());
                profileData.put("aadhaar", citizen.getAadharNum());
                profileData.put("email", citizen.getEmail());
                profileData.put("mobile", citizen.getMobileNum());
                profileData.put("dob", citizen.getDateOfBirth() != null ? citizen.getDateOfBirth().toString() : null);
                profileData.put("state", citizen.getState());
                profileData.put("district", citizen.getDistrict());
                profileData.put("city", citizen.getCity());
                profileData.put("address", citizen.getAddress());
                profileData.put("role", "CITIZEN");
                profileData.put("photoUrl", citizen.getProfilePhotoUrl());
            } else if (normalizedRole.equals("ADMIN")) {
                // Find admin by email
                Admin admin = adminRepository.findByEmail(email);
                if (admin == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Admin profile not found");
                }

                // Map entity to response DTO
                profileData.put("id", admin.getId());
                profileData.put("fullName", admin.getFullName());
                profileData.put("shortName", admin.getFullName() != null && admin.getFullName().contains(" ") 
                        ? admin.getFullName().split(" ")[0] + " " + admin.getFullName().split(" ")[admin.getFullName().split(" ").length - 1]
                        : admin.getFullName());
                profileData.put("aadhaar", admin.getAadharNum());
                profileData.put("email", admin.getEmail());
                profileData.put("mobile", admin.getMobileNum());
                profileData.put("dob", admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : null);
                profileData.put("state", admin.getState());
                profileData.put("district", admin.getDistrict());
                profileData.put("city", admin.getCity());
                profileData.put("address", admin.getAddress());
                profileData.put("role", "ADMIN");
                profileData.put("photoUrl", admin.getProfilePhotoUrl());
            } else if (normalizedRole.equals("LAWYER")) {
                // Find lawyer by email
                Lawyer lawyer = lawyerRepository.findByEmail(email);
                if (lawyer == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Lawyer profile not found");
                }

                // Map entity to response DTO
                profileData.put("id", lawyer.getId());
                profileData.put("fullName", lawyer.getFullName());
                profileData.put("shortName", lawyer.getFullName() != null && lawyer.getFullName().contains(" ") 
                        ? lawyer.getFullName().split(" ")[0] + " " + lawyer.getFullName().split(" ")[lawyer.getFullName().split(" ").length - 1]
                        : lawyer.getFullName());
                profileData.put("aadhaar", lawyer.getAadharNum());
                profileData.put("aadharNum", lawyer.getAadharNum());
                profileData.put("email", lawyer.getEmail());
                profileData.put("mobile", lawyer.getMobileNum());
                profileData.put("mobileNum", lawyer.getMobileNum());
                profileData.put("state", lawyer.getState());
                profileData.put("district", lawyer.getDistrict());
                profileData.put("city", lawyer.getCity());
                profileData.put("address", lawyer.getAddress());
                profileData.put("role", "LAWYER");
                profileData.put("barCouncilId", lawyer.getBarCouncilId());
                profileData.put("barState", lawyer.getBarState());
                profileData.put("specialization", lawyer.getSpecialization());
                profileData.put("experienceYears", lawyer.getExperienceYears());
                profileData.put("experience", lawyer.getExperienceYears());
                profileData.put("aadharProofUrl", lawyer.getAadharProofUrl());
                profileData.put("barCertificateUrl", lawyer.getBarCertificateUrl());
                profileData.put("latitude", lawyer.getLatitude());
                profileData.put("longitude", lawyer.getLongitude());
                profileData.put("photoUrl", null); // Lawyers don't have profile photos yet
            } else if (normalizedRole.equals("NGO")) {
                // Find NGO by email
                NGO ngo = ngoRepository.findByEmail(email);
                if (ngo == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("NGO profile not found");
                }

                // Map entity to response DTO
                profileData.put("id", ngo.getId());
                profileData.put("ngoName", ngo.getNgoName());
                profileData.put("ngoType", ngo.getNgoType());
                profileData.put("registrationNumber", ngo.getRegistrationNumber());
                profileData.put("email", ngo.getEmail());
                profileData.put("contact", ngo.getContact());
                profileData.put("mobile", ngo.getContact()); // Also include as mobile for compatibility
                profileData.put("mobileNum", ngo.getContact()); // Also include as mobileNum for compatibility
                profileData.put("state", ngo.getState());
                profileData.put("district", ngo.getDistrict());
                profileData.put("city", ngo.getCity());
                profileData.put("address", ngo.getAddress());
                profileData.put("pincode", ngo.getPincode());
                profileData.put("role", "NGO");
                profileData.put("registrationCertificateUrl", ngo.getRegistrationCertificateUrl());
                profileData.put("latitude", ngo.getLatitude());
                profileData.put("longitude", ngo.getLongitude());
                profileData.put("photoUrl", null); // NGOs don't have profile photos yet
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unsupported role: " + role);
            }

            return ResponseEntity.ok(profileData);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching profile: " + e.getMessage());
        }
    }

    @PutMapping(value = "/me", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> updateProfile(
            HttpServletRequest request,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "ngoName", required = false) String ngoName,
            @RequestParam(value = "aadhaar", required = false) String aadhaar,
            @RequestParam(value = "mobile", required = false) String mobile,
            @RequestParam(value = "contact", required = false) String contact,
            @RequestParam(value = "dob", required = false) String dob,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        try {
            // Get token from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authorization token required");
            }

            String token = authHeader.substring(7);
            
            // Validate token is not expired
            if (jwtUtil.isTokenExpired(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Token has expired. Please login again.");
            }
            
            // Extract email from token
            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token");
            }

            // Extract role from token
            String role = jwtUtil.extractRole(token);
            if (role == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Invalid role");
            }
            
            // Validate token with email
            if (!jwtUtil.validateToken(token, email)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid token");
            }

            // Normalize role to uppercase for case-insensitive comparison
            String normalizedRole = role.toUpperCase();

            Map<String, Object> profileData = new HashMap<>();
            
            if (normalizedRole.equals("CITIZEN")) {
                // Find citizen by email
                Citizen citizen = citizenRepository.findByEmail(email);
                if (citizen == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Citizen profile not found");
                }

                // Update fields if provided
                if (fullName != null && !fullName.trim().isEmpty()) {
                    citizen.setFullName(fullName.trim());
                }

                if (aadhaar != null && !aadhaar.trim().isEmpty()) {
                    String aadhaarTrimmed = aadhaar.trim();
                    // Check if Aadhaar already exists for another user
                    if (!citizen.getAadharNum().equals(aadhaarTrimmed)) {
                        boolean aadhaarExists = citizenRepository.existsByAadharNum(aadhaarTrimmed);
                        if (aadhaarExists) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Aadhaar number already exists");
                        }
                    }
                    citizen.setAadharNum(aadhaarTrimmed);
                }

                if (mobile != null && !mobile.trim().isEmpty()) {
                    citizen.setMobileNum(mobile.trim());
                }

                if (dob != null && !dob.trim().isEmpty()) {
                    try {
                        java.time.LocalDate dobDate = java.time.LocalDate.parse(dob.trim());
                        citizen.setDateOfBirth(dobDate);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Invalid date format. Use YYYY-MM-DD");
                    }
                }

                if (state != null && !state.trim().isEmpty()) {
                    citizen.setState(state.trim());
                }

                if (district != null && !district.trim().isEmpty()) {
                    citizen.setDistrict(district.trim());
                }

                if (city != null && !city.trim().isEmpty()) {
                    citizen.setCity(city.trim());
                }

                if (address != null && !address.trim().isEmpty()) {
                    citizen.setAddress(address.trim());
                }

                // Handle profile photo upload
                if (profilePhoto != null && !profilePhoto.isEmpty()) {
                    try {
                        // Upload image to Cloudinary
                        String photoUrl = cloudinaryService.uploadImage(profilePhoto, "citizens/profile-photos");
                        citizen.setProfilePhotoUrl(photoUrl);
                    } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to upload profile photo: " + e.getMessage());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
                    }
                }

                // Save updated citizen
                Citizen updatedCitizen = citizenRepository.save(citizen);

                // Map entity to response DTO
                profileData.put("id", updatedCitizen.getId());
                profileData.put("fullName", updatedCitizen.getFullName());
                profileData.put("shortName", updatedCitizen.getFullName() != null && updatedCitizen.getFullName().contains(" ") 
                        ? updatedCitizen.getFullName().split(" ")[0] + " " + updatedCitizen.getFullName().split(" ")[updatedCitizen.getFullName().split(" ").length - 1]
                        : updatedCitizen.getFullName());
                profileData.put("aadhaar", updatedCitizen.getAadharNum());
                profileData.put("email", updatedCitizen.getEmail());
                profileData.put("mobile", updatedCitizen.getMobileNum());
                profileData.put("dob", updatedCitizen.getDateOfBirth() != null ? updatedCitizen.getDateOfBirth().toString() : null);
                profileData.put("state", updatedCitizen.getState());
                profileData.put("district", updatedCitizen.getDistrict());
                profileData.put("city", updatedCitizen.getCity());
                profileData.put("address", updatedCitizen.getAddress());
                profileData.put("role", "CITIZEN");
                profileData.put("photoUrl", updatedCitizen.getProfilePhotoUrl());
            } else if (normalizedRole.equals("ADMIN")) {
                // Find admin by email
                Admin admin = adminRepository.findByEmail(email);
                if (admin == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Admin profile not found");
                }

                // Update fields if provided
                if (fullName != null && !fullName.trim().isEmpty()) {
                    admin.setFullName(fullName.trim());
                }

                if (aadhaar != null && !aadhaar.trim().isEmpty()) {
                    String aadhaarTrimmed = aadhaar.trim();
                    // Check if Aadhaar already exists for another admin
                    if (!admin.getAadharNum().equals(aadhaarTrimmed)) {
                        boolean aadhaarExists = adminRepository.existsByAadharNum(aadhaarTrimmed);
                        if (aadhaarExists) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Aadhaar number already exists");
                        }
                    }
                    admin.setAadharNum(aadhaarTrimmed);
                }

                if (mobile != null && !mobile.trim().isEmpty()) {
                    admin.setMobileNum(mobile.trim());
                }

                if (dob != null && !dob.trim().isEmpty()) {
                    try {
                        java.time.LocalDate dobDate = java.time.LocalDate.parse(dob.trim());
                        admin.setDateOfBirth(dobDate);
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Invalid date format. Use YYYY-MM-DD");
                    }
                }

                if (state != null && !state.trim().isEmpty()) {
                    admin.setState(state.trim());
                }

                if (district != null && !district.trim().isEmpty()) {
                    admin.setDistrict(district.trim());
                }

                if (city != null && !city.trim().isEmpty()) {
                    admin.setCity(city.trim());
                }

                if (address != null && !address.trim().isEmpty()) {
                    admin.setAddress(address.trim());
                }

                // Handle profile photo upload
                if (profilePhoto != null && !profilePhoto.isEmpty()) {
                    try {
                        // Upload image to Cloudinary
                        String photoUrl = cloudinaryService.uploadImage(profilePhoto, "admins/profile-photos");
                        admin.setProfilePhotoUrl(photoUrl);
                    } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to upload profile photo: " + e.getMessage());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
                    }
                }

                // Save updated admin
                Admin updatedAdmin = adminRepository.save(admin);

                // Map entity to response DTO
                profileData.put("id", updatedAdmin.getId());
                profileData.put("fullName", updatedAdmin.getFullName());
                profileData.put("shortName", updatedAdmin.getFullName() != null && updatedAdmin.getFullName().contains(" ") 
                        ? updatedAdmin.getFullName().split(" ")[0] + " " + updatedAdmin.getFullName().split(" ")[updatedAdmin.getFullName().split(" ").length - 1]
                        : updatedAdmin.getFullName());
                profileData.put("aadhaar", updatedAdmin.getAadharNum());
                profileData.put("email", updatedAdmin.getEmail());
                profileData.put("mobile", updatedAdmin.getMobileNum());
                profileData.put("dob", updatedAdmin.getDateOfBirth() != null ? updatedAdmin.getDateOfBirth().toString() : null);
                profileData.put("state", updatedAdmin.getState());
                profileData.put("district", updatedAdmin.getDistrict());
                profileData.put("city", updatedAdmin.getCity());
                profileData.put("address", updatedAdmin.getAddress());
                profileData.put("role", "ADMIN");
                profileData.put("photoUrl", updatedAdmin.getProfilePhotoUrl());
            } else if (normalizedRole.equals("LAWYER")) {
                // Find lawyer by email
                Lawyer lawyer = lawyerRepository.findByEmail(email);
                if (lawyer == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Lawyer profile not found");
                }

                // Update fields if provided (only editable fields - not email, barCouncilId, aadhaar)
                if (fullName != null && !fullName.trim().isEmpty()) {
                    lawyer.setFullName(fullName.trim());
                }

                if (mobile != null && !mobile.trim().isEmpty()) {
                    lawyer.setMobileNum(mobile.trim());
                }

                if (state != null && !state.trim().isEmpty()) {
                    lawyer.setState(state.trim());
                }

                if (district != null && !district.trim().isEmpty()) {
                    lawyer.setDistrict(district.trim());
                }

                if (city != null && !city.trim().isEmpty()) {
                    lawyer.setCity(city.trim());
                }

                if (address != null && !address.trim().isEmpty()) {
                    lawyer.setAddress(address.trim());
                }

                // Handle profile photo upload (if supported in future)
                if (profilePhoto != null && !profilePhoto.isEmpty()) {
                    try {
                        // Upload image to Cloudinary
                        String photoUrl = cloudinaryService.uploadImage(profilePhoto, "lawyers/profile-photos");
                        // Note: Lawyer entity might need a profilePhotoUrl field added
                        // For now, we'll skip this if the field doesn't exist
                    } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to upload profile photo: " + e.getMessage());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
                    }
                }

                // Save updated lawyer
                Lawyer updatedLawyer = lawyerRepository.save(lawyer);

                // Map entity to response DTO
                profileData.put("id", updatedLawyer.getId());
                profileData.put("fullName", updatedLawyer.getFullName());
                profileData.put("shortName", updatedLawyer.getFullName() != null && updatedLawyer.getFullName().contains(" ") 
                        ? updatedLawyer.getFullName().split(" ")[0] + " " + updatedLawyer.getFullName().split(" ")[updatedLawyer.getFullName().split(" ").length - 1]
                        : updatedLawyer.getFullName());
                profileData.put("aadhaar", updatedLawyer.getAadharNum());
                profileData.put("aadharNum", updatedLawyer.getAadharNum());
                profileData.put("email", updatedLawyer.getEmail());
                profileData.put("mobile", updatedLawyer.getMobileNum());
                profileData.put("mobileNum", updatedLawyer.getMobileNum());
                profileData.put("state", updatedLawyer.getState());
                profileData.put("district", updatedLawyer.getDistrict());
                profileData.put("city", updatedLawyer.getCity());
                profileData.put("address", updatedLawyer.getAddress());
                profileData.put("role", "LAWYER");
                profileData.put("barCouncilId", updatedLawyer.getBarCouncilId());
                profileData.put("barState", updatedLawyer.getBarState());
                profileData.put("specialization", updatedLawyer.getSpecialization());
                profileData.put("experienceYears", updatedLawyer.getExperienceYears());
                profileData.put("experience", updatedLawyer.getExperienceYears());
                profileData.put("aadharProofUrl", updatedLawyer.getAadharProofUrl());
                profileData.put("barCertificateUrl", updatedLawyer.getBarCertificateUrl());
                profileData.put("latitude", updatedLawyer.getLatitude());
                profileData.put("longitude", updatedLawyer.getLongitude());
                profileData.put("photoUrl", null);
            } else if (normalizedRole.equals("NGO")) {
                // Find NGO by email
                NGO ngo = ngoRepository.findByEmail(email);
                if (ngo == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("NGO profile not found");
                }

                // Update fields if provided (only editable fields - not email, registrationNumber)
                // For NGO, fullName or ngoName can be used to update ngoName
                if ((fullName != null && !fullName.trim().isEmpty()) || (ngoName != null && !ngoName.trim().isEmpty())) {
                    String nameToUpdate = ngoName != null && !ngoName.trim().isEmpty() ? ngoName.trim() : fullName.trim();
                    ngo.setNgoName(nameToUpdate);
                }

                // Update contact (can come as mobile or contact)
                if (contact != null && !contact.trim().isEmpty()) {
                    ngo.setContact(contact.trim());
                } else if (mobile != null && !mobile.trim().isEmpty()) {
                    ngo.setContact(mobile.trim());
                }

                if (state != null && !state.trim().isEmpty()) {
                    ngo.setState(state.trim());
                }

                if (district != null && !district.trim().isEmpty()) {
                    ngo.setDistrict(district.trim());
                }

                if (city != null && !city.trim().isEmpty()) {
                    ngo.setCity(city.trim());
                }

                if (address != null && !address.trim().isEmpty()) {
                    ngo.setAddress(address.trim());
                }

                if (pincode != null && !pincode.trim().isEmpty()) {
                    ngo.setPincode(pincode.trim());
                }

                // Handle profile photo upload (if supported in future)
                if (profilePhoto != null && !profilePhoto.isEmpty()) {
                    try {
                        // Upload image to Cloudinary
                        String photoUrl = cloudinaryService.uploadImage(profilePhoto, "ngos/profile-photos");
                        // Note: NGO entity might need a profilePhotoUrl field added
                        // For now, we'll skip this if the field doesn't exist
                    } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to upload profile photo: " + e.getMessage());
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(e.getMessage());
                    }
                }

                // Save updated NGO
                NGO updatedNGO = ngoRepository.save(ngo);

                // Map entity to response DTO
                profileData.put("id", updatedNGO.getId());
                profileData.put("ngoName", updatedNGO.getNgoName());
                profileData.put("ngoType", updatedNGO.getNgoType());
                profileData.put("registrationNumber", updatedNGO.getRegistrationNumber());
                profileData.put("email", updatedNGO.getEmail());
                profileData.put("contact", updatedNGO.getContact());
                profileData.put("mobile", updatedNGO.getContact());
                profileData.put("mobileNum", updatedNGO.getContact());
                profileData.put("state", updatedNGO.getState());
                profileData.put("district", updatedNGO.getDistrict());
                profileData.put("city", updatedNGO.getCity());
                profileData.put("address", updatedNGO.getAddress());
                profileData.put("pincode", updatedNGO.getPincode());
                profileData.put("role", "NGO");
                profileData.put("registrationCertificateUrl", updatedNGO.getRegistrationCertificateUrl());
                profileData.put("latitude", updatedNGO.getLatitude());
                profileData.put("longitude", updatedNGO.getLongitude());
                profileData.put("photoUrl", null);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unsupported role: " + role);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile updated successfully");
            response.put("data", profileData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating profile: " + e.getMessage());
        }
    }
}

