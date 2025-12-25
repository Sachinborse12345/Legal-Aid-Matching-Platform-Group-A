package com.example.demo.repository;

import com.example.demo.entity.DirectoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectoryRepository extends JpaRepository<DirectoryEntry, Long> {

    List<DirectoryEntry> findByType(String type);
}
