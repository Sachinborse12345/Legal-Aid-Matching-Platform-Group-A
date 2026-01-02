package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ApproveImportedEntries {

    @Bean
    @Order(2) // Run after DatabaseMigration
    public CommandLineRunner approveExistingImports(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Approving existing imported directory entries...");

                // Update all imported entries from BAR_COUNCIL and NGO_DARPAN to be approved
                int updated = jdbcTemplate.update(
                        "UPDATE directory_entries SET approved = false " +
                                "WHERE source IN ('BAR_COUNCIL', 'NGO_DARPAN')");

                System.out.println("✓ Approved " + updated + " imported directory entries!");

            } catch (Exception e) {
                System.err.println("Failed to approve imported entries: " + e.getMessage());
                // Don't throw - let app continue
            }
        };
    }
}
