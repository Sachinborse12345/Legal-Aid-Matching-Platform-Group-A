package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseMigration {

    @Bean
    @Order(1) // Run before other CommandLineRunners
    public CommandLineRunner runMigration(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Running database migration: Adding approved and experience_years columns...");

                // Add experience_years column
                jdbcTemplate.execute(
                        "ALTER TABLE directory_entries " +
                                "ADD COLUMN IF NOT EXISTS experience_years INTEGER");

                // Add approved column with default value
                jdbcTemplate.execute(
                        "ALTER TABLE directory_entries " +
                                "ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false");

                // Create index for better query performance
                jdbcTemplate.execute(
                        "CREATE INDEX IF NOT EXISTS idx_directory_entries_approved " +
                                "ON directory_entries(approved)");

                // Update existing entries to ensure approved is not null
                jdbcTemplate.execute(
                        "UPDATE directory_entries SET approved = false WHERE approved IS NULL");

                System.out.println("✓ Database migration completed successfully!");

            } catch (Exception e) {
                System.err.println("Migration failed: " + e.getMessage());
                // Don't throw exception - let app continue if columns already exist
            }
        };
    }
}
