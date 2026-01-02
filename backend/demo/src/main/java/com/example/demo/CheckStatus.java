package com.example.demo;

import com.example.demo.entity.Lawyer;
import com.example.demo.repository.LawyerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CheckStatus implements CommandLineRunner {
    private final LawyerRepository lawyerRepository;

    public CheckStatus(LawyerRepository lawyerRepository) {
        this.lawyerRepository = lawyerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("--- CHECKING LAWYER STATUS ---");
        List<Lawyer> lawyers = lawyerRepository.findAll();
        for (Lawyer l : lawyers) {
            if ("SAH/1233/2022".equalsIgnoreCase(l.getBarCouncilId())) {
                System.out.println("FOUND: " + l.getFullName() + " | ID: " + l.getBarCouncilId() + " | Verified: "
                        + l.isVerificationStatus());
            }
        }
        System.out.println("-----------------------------");
    }
}
