package com.example.demo.repository;

import com.example.demo.entity.DirectoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectoryEntryRepository extends JpaRepository<DirectoryEntry, Long> {

    List<DirectoryEntry> findByType(String type);
}
