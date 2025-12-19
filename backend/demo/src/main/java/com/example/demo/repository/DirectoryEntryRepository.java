package com.example.demo.repository;   // <-- must be first line

import com.example.demo.entity.DirectoryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DirectoryEntryRepository extends JpaRepository<DirectoryEntry, Long> {

    Page<DirectoryEntry> findByTypeAndStateAndDistrictAndSpecializationContainingIgnoreCase(
            String type,
            String state,
            String district,
            String specialization,
            Pageable pageable
    );
}