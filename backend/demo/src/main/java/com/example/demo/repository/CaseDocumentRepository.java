package com.example.demo.repository;

import com.example.demo.entity.CaseDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseDocumentRepository extends JpaRepository<CaseDocument, Long> {
    
    List<CaseDocument> findByCaseIdOrderByUploadedAtDesc(Long caseId);
    
    void deleteByCaseId(Long caseId);
}

