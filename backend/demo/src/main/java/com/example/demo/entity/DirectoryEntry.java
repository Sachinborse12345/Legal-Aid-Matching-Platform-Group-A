package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "directory_entries")
public class DirectoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;          // LAWYER / NGO
    private String specialization;
    private String city;
    private String state;
    private String contactPhone;
    private String source;        // BAR_COUNCIL / NGO_DARPAN
    private boolean verified;     // blue tick

    // getters & setters



    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
