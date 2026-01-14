package com.example.demo.repository;

import com.example.demo.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        @Query("SELECT a FROM Appointment a WHERE a.providerId = :userId OR a.requesterId = :userId")
        List<Appointment> findAllByUserId(@Param("userId") Integer userId);

        @Query("SELECT a FROM Appointment a WHERE a.providerId = :providerId AND UPPER(a.providerRole) = UPPER(:providerRole)")
        List<Appointment> findByProviderIdAndProviderRole(@Param("providerId") Integer providerId,
                        @Param("providerRole") String providerRole);

        @Query("SELECT a FROM Appointment a WHERE a.requesterId = :requesterId AND UPPER(a.requesterRole) = UPPER(:requesterRole)")
        List<Appointment> findByRequesterIdAndRequesterRole(@Param("requesterId") Integer requesterId,
                        @Param("requesterRole") String requesterRole);

        @Query("SELECT a FROM Appointment a WHERE a.providerId = :providerId AND UPPER(a.providerRole) = UPPER(:providerRole) "
                        +
                        "AND (a.startTime < :endTime AND a.endTime > :startTime) "
                        +
                        "AND (UPPER(a.status) = 'CONFIRMED' OR UPPER(a.status) = 'PENDING')")
        List<Appointment> findOverlappingAppointments(@Param("providerId") Integer providerId,
                        @Param("providerRole") String providerRole,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT a FROM Appointment a WHERE a.requesterId = :requesterId AND UPPER(a.requesterRole) = UPPER(:requesterRole) "
                        +
                        "AND (a.startTime < :endTime AND a.endTime > :startTime) "
                        +
                        "AND (UPPER(a.status) = 'CONFIRMED' OR UPPER(a.status) = 'PENDING')")
        List<Appointment> findRequesterOverlappingAppointments(@Param("requesterId") Integer requesterId,
                        @Param("requesterRole") String requesterRole,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);
}
