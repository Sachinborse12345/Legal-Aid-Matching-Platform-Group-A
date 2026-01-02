package com.example.demo.controller;

import com.example.demo.entity.Lawyer;
import com.example.demo.repository.DirectoryEntryRepository;
import com.example.demo.repository.LawyerRepository;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.LawyerImportService;
import com.example.demo.service.BarCouncilImportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lawyers")
@CrossOrigin(origins = "http://localhost:5173")
public class LawyerController {

    private final LawyerRepository lawyerRepository;
    private final CloudinaryService cloudinaryService;
    private final LawyerImportService lawyerImportService;
    private final DirectoryEntryRepository directoryEntryRepository;
    private final BarCouncilImportService barCouncilImportService;

    public LawyerController(
            LawyerRepository lawyerRepository,
            CloudinaryService cloudinaryService,
            LawyerImportService lawyerImportService,
            DirectoryEntryRepository directoryEntryRepository,
            BarCouncilImportService barCouncilImportService) {
        this.lawyerRepository = lawyerRepository;
        this.cloudinaryService = cloudinaryService;
        this.lawyerImportService = lawyerImportService;
        this.directoryEntryRepository = directoryEntryRepository;
        this.barCouncilImportService = barCouncilImportService;
    }

    // Citizens: see all lawyers (verified + unverified)
    @GetMapping
    public org.springframework.data.domain.Page<Lawyer> getAllLawyers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return lawyerRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lawyer> getLawyerById(@PathVariable Integer id) {
        return lawyerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Search still returns all; frontend can show badge for verificationStatus
    @GetMapping("/search")
    public List<Lawyer> searchLawyers(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization) {
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

    @PostMapping("/add")
    public ResponseEntity<?> addLawyer(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("aadhar") String aadhar,
            @RequestParam(value = "aadharProof", required = false) MultipartFile aadharProof,
            @RequestParam("barId") String rawBarId,
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
            @RequestParam("password") String password) {
        try {
            String barId = rawBarId.trim().toUpperCase();
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
            int expYears = Integer.parseInt(experience);
            lawyer.setExperienceYears(expYears);
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

            // Check if verified in existing directory (from import)
            boolean verifiedInDirectory = directoryEntryRepository.existsByTypeAndBarCouncilId(
                    "LAWYER",
                    lawyer.getBarCouncilId());
            lawyer.setVerificationStatus(verifiedInDirectory);

            Lawyer savedLawyer = lawyerRepository.save(lawyer);

            // SYNC TO DIRECTORY
            // Check if entry exists to avoid duplicates or update existing placeholder
            com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository.findByTypeAndBarCouncilId("LAWYER",
                    barId);
            if (entry == null) {
                entry = new com.example.demo.entity.DirectoryEntry();
                entry.setType("LAWYER");
                entry.setBarCouncilId(barId);
                entry.setSource("USER_REGISTRATION");
            }
            // Update fields
            entry.setName(fullName);
            entry.setSpecialization(specialization);
            entry.setExperienceYears(expYears);
            entry.setContactPhone(phone);
            entry.setContactEmail(email);
            entry.setState(state);
            entry.setDistrict(district);
            entry.setCity(city);
            entry.setLatitude(lawyer.getLatitude());
            entry.setLongitude(lawyer.getLongitude());
            entry.setVerified(verifiedInDirectory);
            entry.setApproved(false); // New registrations need approval

            directoryEntryRepository.save(entry);

            return ResponseEntity.ok(savedLawyer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving lawyer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLawyer(@PathVariable Integer id) {
        if (!lawyerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        lawyerRepository.deleteById(id);
        return ResponseEntity.ok("Lawyer deleted successfully");
    }

    @PostMapping("/admin/import-lawyers")
    public ResponseEntity<String> importLawyersFromCSV(
            @RequestParam("file") MultipartFile file) throws Exception {

        lawyerImportService.importFromCSV(file);
        return ResponseEntity.ok("Lawyers imported successfully");
    }

    @PostMapping("/admin/import-bar-council")
    public ResponseEntity<String> importBarCouncilData() {
        try {
            barCouncilImportService.importCSV("bar_council_data.csv");
            return ResponseEntity.ok("Bar Council Data imported successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error importing Bar Council data: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyLawyer(@PathVariable("id") Integer id) {
        try {
            return lawyerRepository.findById(id)
                    .map(lawyer -> {
                        lawyer.setVerificationStatus(true);
                        lawyerRepository.save(lawyer);
                        return ResponseEntity.ok("Lawyer verified successfully");
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying lawyer: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveLawyer(@PathVariable("id") Integer id) {
        try {
            return lawyerRepository.findById(id)
                    .map(lawyer -> {
                        lawyer.setApproved(true);
                        lawyerRepository.save(lawyer);

                        // SYNC: Set directory entry to approved
                        System.out.println(
                                "DEBUG: Syncing approval for lawyer with Bar Council ID: " + lawyer.getBarCouncilId());
                        com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository
                                .findByTypeAndBarCouncilId("LAWYER", lawyer.getBarCouncilId());
                        if (entry != null) {
                            System.out.println("DEBUG: Found directory entry, setting approved=true");
                            entry.setApproved(true);
                            directoryEntryRepository.save(entry);
                            System.out.println("DEBUG: Directory entry updated successfully");
                        } else {
                            System.out.println("DEBUG: WARNING - No directory entry found for Bar Council ID: "
                                    + lawyer.getBarCouncilId());
                        }

                        return ResponseEntity.ok("Lawyer approved successfully");
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approving lawyer: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Integer id, @RequestBody Lawyer lawyerDetails) {
        return lawyerRepository.findById(id).map(lawyer -> {
            lawyer.setFullName(lawyerDetails.getFullName());
            lawyer.setMobileNum(lawyerDetails.getMobileNum());
            lawyer.setSpecialization(lawyerDetails.getSpecialization());
            lawyer.setBarState(lawyerDetails.getBarState());
            lawyer.setBarCouncilId(lawyerDetails.getBarCouncilId());
            lawyer.setExperienceYears(lawyerDetails.getExperienceYears());
            lawyer.setAddress(lawyerDetails.getAddress());
            lawyer.setCity(lawyerDetails.getCity());
            lawyer.setState(lawyerDetails.getState());
            lawyer.setDistrict(lawyerDetails.getDistrict());
            if (lawyerDetails.getLatitude() != null)
                lawyer.setLatitude(lawyerDetails.getLatitude());
            if (lawyerDetails.getLongitude() != null)
                lawyer.setLongitude(lawyerDetails.getLongitude());

            Lawyer updatedLawyer = lawyerRepository.save(lawyer);

            // SYNC TO DIRECTORY
            com.example.demo.entity.DirectoryEntry entry = directoryEntryRepository.findByTypeAndBarCouncilId("LAWYER",
                    lawyer.getBarCouncilId());
            if (entry != null) {
                entry.setName(lawyer.getFullName());
                entry.setSpecialization(lawyer.getSpecialization());
                entry.setExperienceYears(lawyer.getExperienceYears());
                entry.setContactPhone(lawyer.getMobileNum());
                entry.setState(lawyer.getState());
                entry.setDistrict(lawyer.getDistrict());
                entry.setCity(lawyer.getCity());
                if (lawyer.getLatitude() != null)
                    entry.setLatitude(lawyer.getLatitude());
                if (lawyer.getLongitude() != null)
                    entry.setLongitude(lawyer.getLongitude());
                directoryEntryRepository.save(entry);
            }

            return ResponseEntity.ok(updatedLawyer);
        }).orElse(ResponseEntity.notFound().build());
    }
}
