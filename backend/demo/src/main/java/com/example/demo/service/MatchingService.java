package com.example.demo.service;

import com.example.demo.entity.Case;
import com.example.demo.entity.Lawyer;
import com.example.demo.entity.NGO;
import com.example.demo.repository.CaseRepository;
import com.example.demo.repository.LawyerRepository;
import com.example.demo.repository.NGORepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MatchingService {

    private final CaseRepository caseRepository;
    private final LawyerRepository lawyerRepository;
    private final NGORepository ngoRepository;

    public MatchingService(CaseRepository caseRepository, LawyerRepository lawyerRepository,
            NGORepository ngoRepository) {
        this.caseRepository = caseRepository;
        this.lawyerRepository = lawyerRepository;
        this.ngoRepository = ngoRepository;
    }

    public Map<String, Object> findMatchesForCase(Long caseId) {
        Optional<Case> caseOpt = caseRepository.findById(caseId);
        if (caseOpt.isEmpty()) {
            throw new RuntimeException("Case not found");
        }

        Case caseEntity = caseOpt.get();
        String specialization = caseEntity.getSpecialization();
        String ngoType = caseEntity.getNgoType();
        String location = caseEntity.getIncidentPlace();

        Map<String, Object> matches = new HashMap<>();

        if (specialization != null && !specialization.isEmpty()) {
            List<Lawyer> matchedLawyers = lawyerRepository.findMatches(specialization,
                    location != null ? location : "");
            matches.put("lawyers", matchedLawyers);
        }

        if (ngoType != null && !ngoType.isEmpty()) {
            List<NGO> matchedNgos = ngoRepository.findMatches(ngoType, location != null ? location : "");
            matches.put("ngos", matchedNgos);
        }

        return matches;
    }
}
