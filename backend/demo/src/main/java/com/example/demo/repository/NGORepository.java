package com.example.demo.repository;

import com.example.demo.entity.NGO;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NGORepository extends JpaRepository<NGO, Integer> {

    // For citizen \"Find NGO\" page (verified/unverified lists)
    List<NGO> findByVerificationStatusTrue();

    List<NGO> findByVerificationStatusFalse();

    // For validations during registration
    boolean existsByEmail(String email);

    boolean existsByRegistrationNumber(String registrationNumber);

    // For login in AuthController (role = \"NGO\")
    NGO findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT n FROM NGO n WHERE n.isApproved = true AND n.ngoType = :ngoType AND (LOWER(n.district) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(n.state) LIKE LOWER(CONCAT('%', :location, '%')) OR LOWER(n.city) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<NGO> findMatches(String ngoType, String location);
}
