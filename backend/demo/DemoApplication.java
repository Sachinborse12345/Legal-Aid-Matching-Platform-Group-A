package com.example.demo;

import com.example.demo.service.NGODarpanImportService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    CommandLineRunner loadNGOData(NGODarpanImportService service) {
        return args -> {
            service.importCSV("ngo_darpan.csv");
        };
    }
}
