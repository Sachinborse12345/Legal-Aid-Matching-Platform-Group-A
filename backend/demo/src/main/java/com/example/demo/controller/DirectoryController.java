package com.example.demo.controller;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.service.DirectoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/directory")
public class DirectoryController {

    private final DirectoryService service;

    public DirectoryController(DirectoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<DirectoryEntry> getAll() {
        return service.getAll();
    }

    @GetMapping("/lawyers")
    public List<DirectoryEntry> lawyers() {
        return service.getLawyers();
    }

    @GetMapping("/ngos")
    public List<DirectoryEntry> ngos() {
        return service.getNGOs();
    }
}
