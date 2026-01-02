package com.example.demo.controller;

import com.example.demo.service.DirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/directory")
@CrossOrigin(origins = "http://localhost:5173")
public class DirectoryUploadController {

    private final DirectoryService directoryService;

    public DirectoryUploadController(DirectoryService directoryService) {
        this.directoryService = directoryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDirectory(
            @RequestParam("file") MultipartFile file) {

        directoryService.uploadFile(file);
        return ResponseEntity.ok("Directory uploaded successfully");
    }
}
