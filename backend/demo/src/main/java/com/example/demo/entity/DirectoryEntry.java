package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "directory_entries")
public class DirectoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Common display name (lawyer / NGO / other)
    @Column(nullable = false)
    private String name;

    // LAWYER, NGO, INTERNATIONAL, etc.
    @Column(length = 30, nullable = false)
    private String type;

    // e.g., "Criminal", "Family", "Women/Children", etc.
    private String specialization;

    private String state;
    private String district;
    private String city;
    private String country;

    private String contactEmail;
    private String contactPhone;

    // NGO_DARPAN, BAR_COUNCIL, INTERNAL, INTERNATIONAL, etc.
    @Column(length = 50, nullable = false)
    private String source;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // getters and setters (or Lombok @Getter/@Setter/@NoArgsConstructor/@AllArgsConstructor)
}
