package com.example.demo.controller;

import com.example.demo.entity.Case;
import com.example.demo.entity.CaseDocument;
import com.example.demo.repository.CaseRepository;
import com.example.demo.repository.CaseDocumentRepository;
import com.example.demo.service.CloudinaryService;
import com.example.demo.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cases")
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class CaseController {

    private final CaseRepository caseRepository;
    private final CaseDocumentRepository caseDocumentRepository;
    private final JwtUtil jwtUtil;
    private final CloudinaryService cloudinaryService;

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    public CaseController(CaseRepository caseRepository, CaseDocumentRepository caseDocumentRepository, JwtUtil jwtUtil, CloudinaryService cloudinaryService) {
        this.caseRepository = caseRepository;
        this.caseDocumentRepository = caseDocumentRepository;
        this.jwtUtil = jwtUtil;
        this.cloudinaryService = cloudinaryService;
    }

    // Extract userId from JWT token
    private Integer extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        try {
            return jwtUtil.extractClaim(token, claims -> claims.get("userId", Integer.class));
        } catch (Exception e) {
            return null;
        }
    }

    // Save step data (creates new case or updates existing draft)
    @PostMapping("/save-step")
    public ResponseEntity<?> saveStep(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Integer step = (Integer) requestData.get("step");
            Long caseId = requestData.get("caseId") != null ? 
                    Long.valueOf(requestData.get("caseId").toString()) : null;

            Case caseEntity;

            // If caseId provided, update that case; otherwise find latest draft or create new
            if (caseId != null) {
                Optional<Case> existingCase = caseRepository.findByIdAndCitizenId(caseId, citizenId);
                if (existingCase.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
                }
                caseEntity = existingCase.get();
            } else {
                // Find latest draft case for this user or create new
                Optional<Case> draftCase = caseRepository.findFirstByCitizenIdAndIsSubmittedFalseOrderByUpdatedAtDesc(citizenId);
                caseEntity = draftCase.orElseGet(() -> {
                    Case newCase = new Case();
                    newCase.setCitizenId(citizenId);
                    return newCase;
                });
            }

            // Update fields based on step
            updateCaseFields(caseEntity, step, requestData);
            caseEntity.setCurrentStep(step);

            Case saved = caseRepository.save(caseEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Step " + step + " saved successfully");
            response.put("caseId", saved.getId());
            response.put("caseNumber", saved.getCaseNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving step: " + e.getMessage());
        }
    }

    // Submit final case
    @PostMapping("/submit")
    public ResponseEntity<?> submitCase(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Long caseId = requestData.get("caseId") != null ?
                    Long.valueOf(requestData.get("caseId").toString()) : null;

            Case caseEntity;
            if (caseId != null) {
                Optional<Case> existingCase = caseRepository.findByIdAndCitizenId(caseId, citizenId);
                if (existingCase.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
                }
                caseEntity = existingCase.get();
            } else {
                Optional<Case> draftCase = caseRepository.findFirstByCitizenIdAndIsSubmittedFalseOrderByUpdatedAtDesc(citizenId);
                if (draftCase.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No draft case found");
                }
                caseEntity = draftCase.get();
            }

            caseEntity.setIsSubmitted(true);
            caseEntity.setStatus("SUBMITTED");
            caseEntity.setCurrentStep(7);

            Case saved = caseRepository.save(caseEntity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Case submitted successfully");
            response.put("caseId", saved.getId());
            response.put("caseNumber", saved.getCaseNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error submitting case: " + e.getMessage());
        }
    }

    // Get all cases for logged-in user
    @GetMapping("/my-cases")
    public ResponseEntity<?> getMyCases(@RequestHeader("Authorization") String authHeader) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            List<Case> cases = caseRepository.findByCitizenIdOrderByUpdatedAtDesc(citizenId);
            return ResponseEntity.ok(cases);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching cases: " + e.getMessage());
        }
    }

    // Get current draft case (for resuming)
    @GetMapping("/draft")
    public ResponseEntity<?> getDraftCase(@RequestHeader("Authorization") String authHeader) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Optional<Case> draftCase = caseRepository.findFirstByCitizenIdAndIsSubmittedFalseOrderByUpdatedAtDesc(citizenId);
            if (draftCase.isEmpty()) {
                return ResponseEntity.ok(null);
            }
            return ResponseEntity.ok(draftCase.get());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching draft: " + e.getMessage());
        }
    }

    // Start a new case (clears any existing draft behavior)
    @PostMapping("/new")
    public ResponseEntity<?> startNewCase(@RequestHeader("Authorization") String authHeader) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Case newCase = new Case();
            newCase.setCitizenId(citizenId);
            Case saved = caseRepository.save(newCase);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "New case started");
            response.put("caseId", saved.getId());
            response.put("caseNumber", saved.getCaseNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating case: " + e.getMessage());
        }
    }

    // Get case by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Optional<Case> caseEntity = caseRepository.findByIdAndCitizenId(id, citizenId);
            if (caseEntity.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
            }
            return ResponseEntity.ok(caseEntity.get());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching case: " + e.getMessage());
        }
    }

    // Upload documents endpoint
    @PostMapping("/upload-documents")
    public ResponseEntity<?> uploadDocuments(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("caseId") Long caseId,
            @RequestParam("documents") MultipartFile[] documents) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Optional<Case> existingCase = caseRepository.findByIdAndCitizenId(caseId, citizenId);
            if (existingCase.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
            }

            List<CaseDocument> savedDocuments = new ArrayList<>();
            List<String> errors = new ArrayList<>();

            for (MultipartFile file : documents) {
                // Validate file size (2MB max)
                if (file.getSize() > MAX_FILE_SIZE) {
                    errors.add(file.getOriginalFilename() + ": File size exceeds 2MB limit");
                    continue;
                }

                // Validate file type - only PDFs allowed
                String contentType = file.getContentType();
                if (contentType == null || !contentType.equals("application/pdf")) {
                    errors.add(file.getOriginalFilename() + ": Only PDF files allowed");
                    continue;
                }

                try {
                    // Upload to Cloudinary
                    String url = cloudinaryService.uploadFile(file, "cases/" + caseId + "/documents");
                    
                    // Create and save CaseDocument entity
                    CaseDocument document = new CaseDocument();
                    document.setCaseId(caseId);
                    document.setDocumentUrl(url);
                    document.setDocumentFilename(file.getOriginalFilename());
                    document.setFileSize(file.getSize());
                    document.setContentType(contentType);
                    
                    CaseDocument savedDocument = caseDocumentRepository.save(document);
                    savedDocuments.add(savedDocument);
                } catch (Exception e) {
                    errors.add(file.getOriginalFilename() + ": Upload failed - " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Documents uploaded successfully");
            response.put("uploadedCount", savedDocuments.size());
            response.put("errors", errors);
            
            // Return document details
            List<Map<String, Object>> documentList = new ArrayList<>();
            for (CaseDocument doc : savedDocuments) {
                Map<String, Object> docMap = new HashMap<>();
                docMap.put("id", doc.getId());
                docMap.put("documentUrl", doc.getDocumentUrl());
                docMap.put("documentFilename", doc.getDocumentFilename());
                docMap.put("fileSize", doc.getFileSize());
                docMap.put("contentType", doc.getContentType());
                docMap.put("uploadedAt", doc.getUploadedAt());
                documentList.add(docMap);
            }
            response.put("documents", documentList);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading documents: " + e.getMessage());
        }
    }

    // Get all documents for a case
    @GetMapping("/{caseId}/documents")
    public ResponseEntity<?> getCaseDocuments(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long caseId) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Optional<Case> existingCase = caseRepository.findByIdAndCitizenId(caseId, citizenId);
            if (existingCase.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
            }

            List<CaseDocument> documents = caseDocumentRepository.findByCaseIdOrderByUploadedAtDesc(caseId);
            
            List<Map<String, Object>> documentList = new ArrayList<>();
            for (CaseDocument doc : documents) {
                Map<String, Object> docMap = new HashMap<>();
                docMap.put("id", doc.getId());
                docMap.put("documentUrl", doc.getDocumentUrl());
                docMap.put("documentFilename", doc.getDocumentFilename());
                docMap.put("fileSize", doc.getFileSize());
                docMap.put("contentType", doc.getContentType());
                docMap.put("uploadedAt", doc.getUploadedAt());
                documentList.add(docMap);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("documents", documentList);
            response.put("count", documents.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching documents: " + e.getMessage());
        }
    }

    // Delete a document
    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long documentId) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Optional<CaseDocument> documentOpt = caseDocumentRepository.findById(documentId);
            if (documentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }

            CaseDocument document = documentOpt.get();
            
            // Verify the case belongs to the citizen
            Optional<Case> caseOpt = caseRepository.findByIdAndCitizenId(document.getCaseId(), citizenId);
            if (caseOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to delete this document");
            }

            caseDocumentRepository.delete(document);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting document: " + e.getMessage());
        }
    }

    // Update case status (mark as completed/pending)
    @PutMapping("/{caseId}/status")
    public ResponseEntity<?> updateCaseStatus(
            @PathVariable Long caseId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Integer citizenId = extractUserId(authHeader);
            if (citizenId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            Case caseEntity = caseRepository.findById(caseId).orElse(null);
            if (caseEntity == null || !caseEntity.getCitizenId().equals(citizenId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Case not found");
            }

            String newStatus = body.get("status");
            if (newStatus != null) {
                caseEntity.setStatus(newStatus);
                caseRepository.save(caseEntity);
            }

            return ResponseEntity.ok(caseEntity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating status: " + e.getMessage());
        }
    }

    private void updateCaseFields(Case caseEntity, Integer step, Map<String, Object> data) {
        switch (step) {
            case 0: // Applicant Details
                if (data.get("applicantName") != null) caseEntity.setApplicantName(data.get("applicantName").toString());
                if (data.get("email") != null) caseEntity.setEmail(data.get("email").toString());
                if (data.get("mobile") != null) caseEntity.setMobile(data.get("mobile").toString());
                if (data.get("aadhaar") != null) caseEntity.setAadhaar(data.get("aadhaar").toString());
                break;
            case 1: // Victim Details
                if (data.get("victimName") != null) caseEntity.setVictimName(data.get("victimName").toString());
                if (data.get("relation") != null) caseEntity.setRelation(data.get("relation").toString());
                if (data.get("victimGender") != null) caseEntity.setVictimGender(data.get("victimGender").toString());
                if (data.get("victimAge") != null) caseEntity.setVictimAge(Integer.valueOf(data.get("victimAge").toString()));
                break;
            case 2: // Case Details
                if (data.get("caseTitle") != null) caseEntity.setCaseTitle(data.get("caseTitle").toString());
                if (data.get("caseType") != null) caseEntity.setCaseType(data.get("caseType").toString());
                break;
            case 3: // Incident Details
                if (data.get("incidentDate") != null) caseEntity.setIncidentDate(LocalDate.parse(data.get("incidentDate").toString()));
                if (data.get("incidentPlace") != null) caseEntity.setIncidentPlace(data.get("incidentPlace").toString());
                if (data.get("urgency") != null) caseEntity.setUrgency(data.get("urgency").toString());
                break;
            case 4: // Legal Preference
                if (data.get("specialization") != null) caseEntity.setSpecialization(data.get("specialization").toString());
                if (data.get("courtType") != null) caseEntity.setCourtType(data.get("courtType").toString());
                if (data.get("seekingNgoHelp") != null) caseEntity.setSeekingNgoHelp(data.get("seekingNgoHelp").toString());
                if (data.get("ngoType") != null) caseEntity.setNgoType(data.get("ngoType").toString());
                break;
            case 5: // Case Explanation
                if (data.get("background") != null) caseEntity.setBackground(data.get("background").toString());
                if (data.get("relief") != null) caseEntity.setRelief(data.get("relief").toString());
                break;
            case 6: // Documents
                if (data.get("documentsUrl") != null) caseEntity.setDocumentsUrl(data.get("documentsUrl").toString());
                break;
        }
    }
}

