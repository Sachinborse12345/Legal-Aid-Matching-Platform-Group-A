package com.example.demo.controller;

import com.example.demo.entity.NGO;
import com.example.demo.repository.DirectoryEntryRepository;
import com.example.demo.repository.NGORepository;
import com.example.demo.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ngos")
@CrossOrigin(origins = "http://localhost:5173")
public class NGOController {

    private final NGORepository repo;
    private final CloudinaryService cloudinaryService;
    private final DirectoryEntryRepository directoryEntryRepository;

    public NGOController(NGORepository repo,
            CloudinaryService cloudinaryService,
            DirectoryEntryRepository directoryEntryRepository) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
        this.directoryEntryRepository = directoryEntryRepository;
    }

    // Citizens: see all NGOs (verified + unverified)
    @GetMapping
    public org.springframework.data.domain.Page<NGO> getAll(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return repo.findAll(pageable);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addNGO(
            @RequestParam("ngoName") String ngoName,
            @RequestParam("ngoType") String ngoType,
            @RequestParam("registrationNumber") String rawRegistrationNumber,
            @RequestParam(value = "registrationCertificate", required = false) MultipartFile registrationCertificate,
            @RequestParam("contact") String contact,
            @RequestParam("email") String email,
            @RequestParam("address") String address,
            @RequestParam("state") String state,
            @RequestParam("district") String district,
            @RequestParam("city") String city,
            @RequestParam("pincode") String pincode,
            @RequestParam(value = "latitude", required = false) String latitude,
            @RequestParam(value = "longitude", required = false) String longitude,
            @RequestParam("password") String password) {
        try {
            String registrationNumber = rawRegistrationNumber.trim().toUpperCase();
            if (repo.existsByEmail(email)) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Email already exists");
            }

            if (repo.existsByRegistrationNumber(registrationNumber)) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("Registration Number already exists");
            }

            NGO ngo = new NGO();
            ngo.setNgoName(ngoName);
            ngo.setNgoType(ngoType);
            ngo.setRegistrationNumber(registrationNumber);
            ngo.setContact(contact);
            ngo.setEmail(email);
            ngo.setAddress(address);
            ngo.setState(state);
            ngo.setDistrict(district);
            ngo.setCity(city);
            ngo.setPincode(pincode);

            if (latitude != null && !latitude.trim().isEmpty()) {
                try {
                    ngo.setLatitude(Double.parseDouble(latitude));
                } catch (NumberFormatException e) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Invalid latitude value. Must be a number.");
                }
            }

            if (longitude != null && !longitude.trim().isEmpty()) {
                try {
                    ngo.setLongitude(Double.parseDouble(longitude));
                } catch (NumberFormatException e) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Invalid longitude value. Must be a number.");
                }
            }

            ngo.setPassword(password);

            if (registrationCertificate != null && !registrationCertificate.isEmpty()) {
                try {
                    String registrationCertUrl = cloudinaryService.uploadFile(registrationCertificate,
                            "ngos/registration-certificates");
                    ngo.setRegistrationCertificateUrl(registrationCertUrl);
                    ngo.setRegistrationCertificateFilename(
                            registrationCertificate.getOriginalFilename());
                } catch (IllegalArgumentException e) {
                    return ResponseEntity
                            .status(HttpStatus.BAD_REQUEST)
                            .body("Registration Certificate: " + e.getMessage());
                } catch (IOException e) {
                    return ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Failed to upload Registration Certificate to Cloudinary: " + e.getMessage());
                }
            }

            // verification against directory_entries
            boolean verified = directoryEntryRepository.existsByTypeAndRegistrationNumber(
                    "NGO",
                    registrationNumber);
            ngo.setVerificationStatus(verified);

            NGO saved = repo.save(ngo);

            // SYNC TO DIRECTORY
            com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository
                    .findByTypeAndRegistrationNumber("NGO", registrationNumber);
            if (entry == null) {
                entry = new com.example.demo.entity.DirectoryEntry();
                entry.setType("NGO");
                entry.setRegistrationNumber(registrationNumber);
                entry.setSource("USER_REGISTRATION");
            }
            entry.setName(ngoName);
            entry.setContactPhone(contact);
            entry.setContactEmail(email);
            entry.setState(state);
            entry.setDistrict(district);
            entry.setCity(city);
            if (ngo.getLatitude() != null)
                entry.setLatitude(ngo.getLatitude());
            if (ngo.getLongitude() != null)
                entry.setLongitude(ngo.getLongitude());
            entry.setVerified(verified);
            entry.setApproved(false); // New registrations need approval
            directoryEntryRepository.save(entry);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving NGO: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNGO(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.ok("NGO deleted successfully");
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyNGO(@PathVariable("id") Integer id) {
        return repo.findById(id)
                .map(ngo -> {
                    ngo.setVerificationStatus(true);
                    repo.save(ngo);
                    return ResponseEntity.ok("NGO verified successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveNGO(@PathVariable("id") Integer id) {
        return repo.findById(id)
                .map(ngo -> {
                    ngo.setApproved(true);
                    repo.save(ngo);

                    // SYNC: Set directory entry to approved
                    System.out.println(
                            "DEBUG: Syncing approval for NGO with Registration Number: " + ngo.getRegistrationNumber());
                    com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository
                            .findByTypeAndRegistrationNumber("NGO", ngo.getRegistrationNumber());
                    if (entry != null) {
                        System.out.println("DEBUG: Found directory entry, setting approved=true");
                        entry.setApproved(true);
                        directoryEntryRepository.save(entry);
                        System.out.println("DEBUG: Directory entry updated successfully");
                    } else {
                        System.out.println("DEBUG: WARNING - No directory entry found for Registration Number: "
                                + ngo.getRegistrationNumber());
                    }

                    return ResponseEntity.ok("NGO approved successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Integer id, @RequestBody NGO ngoDetails) {
        return repo.findById(id).map(ngo -> {
            ngo.setNgoName(ngoDetails.getNgoName());
            ngo.setNgoType(ngoDetails.getNgoType());
            ngo.setRegistrationNumber(ngoDetails.getRegistrationNumber());
            ngo.setContact(ngoDetails.getContact());
            ngo.setAddress(ngoDetails.getAddress());
            ngo.setState(ngoDetails.getState());
            ngo.setDistrict(ngoDetails.getDistrict());
            ngo.setCity(ngoDetails.getCity());
            ngo.setPincode(ngoDetails.getPincode());
            if (ngoDetails.getLatitude() != null)
                ngo.setLatitude(ngoDetails.getLatitude());
            if (ngoDetails.getLongitude() != null)
                ngo.setLongitude(ngoDetails.getLongitude());

            NGO updatedNgo = repo.save(ngo);

            // SYNC TO DIRECTORY
            com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository
                    .findByTypeAndRegistrationNumber("NGO", ngo.getRegistrationNumber());
            if (entry != null) {
                entry.setName(ngo.getNgoName());
                entry.setContactPhone(ngo.getContact());
                entry.setState(ngo.getState());
                entry.setDistrict(ngo.getDistrict());
                entry.setCity(ngo.getCity());
                if (ngo.getLatitude() != null)
                    entry.setLatitude(ngo.getLatitude());
                if (ngo.getLongitude() != null)
                    entry.setLongitude(ngo.getLongitude());
                directoryEntryRepository.save(entry);
            }

            return ResponseEntity.ok(updatedNgo);
        }).orElse(ResponseEntity.notFound().build());
    }
}
