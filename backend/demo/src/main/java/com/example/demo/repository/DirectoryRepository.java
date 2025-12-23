package com.example.demo.repository;

import com.example.demo.entity.Directory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectoryRepository extends JpaRepository<Directory, Long> {
}
