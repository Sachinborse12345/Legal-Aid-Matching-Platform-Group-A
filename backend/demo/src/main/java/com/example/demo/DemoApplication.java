package com.example.demo;

import com.example.demo.service.NGODarpanImportService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    CommandLineRunner seedNgoDirectory(NGODarpanImportService ngoImportService,
            com.example.demo.repository.LawyerRepository lawyerRepository,
            com.example.demo.repository.AppointmentRepository appointmentRepository) {
        return args -> {
            // run only once; you can comment this line later if needed
            ngoImportService.importCSV("ngo_darpan_extended.csv");

            // Seed Dummy Appointments
            try {
                // CLEAR EXISTING APPOINTMENTS (Requested by user)
                appointmentRepository.deleteAll();
                System.out.println("Cleared all existing appointments.");

                java.util.List<com.example.demo.entity.Lawyer> lawyers = lawyerRepository.findAll();
                if (!lawyers.isEmpty()) {
                    com.example.demo.entity.Lawyer provider = lawyers.get(0);
                    Integer providerId = provider.getId();

                    System.out.println("Seeding appointments for Lawyer ID: " + providerId);

                    // Book 10:00 - 11:00
                    com.example.demo.entity.Appointment appt1 = new com.example.demo.entity.Appointment();
                    appt1.setProviderId(providerId);
                    appt1.setProviderRole("LAWYER");
                    appt1.setRequesterId(1); // Assuming dummy requester
                    appt1.setRequesterRole("CITIZEN");
                    appt1.setStartTime(java.time.LocalDate.now().plusDays(1).atTime(10, 0));
                    appt1.setEndTime(java.time.LocalDate.now().plusDays(1).atTime(11, 0));
                    appt1.setStatus("CONFIRMED");
                    appt1.setType("Legal Consultation");
                    appt1.setDescription("Dummy appointment 1");
                    appointmentRepository.save(appt1);

                    // Book 14:00 - 15:00
                    com.example.demo.entity.Appointment appt2 = new com.example.demo.entity.Appointment();
                    appt2.setProviderId(providerId);
                    appt2.setProviderRole("LAWYER");
                    appt2.setRequesterId(1);
                    appt2.setRequesterRole("CITIZEN");
                    appt2.setStartTime(java.time.LocalDate.now().plusDays(1).atTime(14, 0));
                    appt2.setEndTime(java.time.LocalDate.now().plusDays(1).atTime(15, 0));
                    appt2.setStatus("CONFIRMED");
                    appt2.setType("Legal Consultation");
                    appt2.setDescription("Dummy appointment 2");
                    appointmentRepository.save(appt2);
                }
            } catch (Exception e) {
                System.err.println("Failed to seed appointments: " + e.getMessage());
            }
        };
    }
}
