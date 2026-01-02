package com.example.demo.controller;

import com.example.demo.entity.DirectoryEntry;
import com.example.demo.service.DirectoryService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/directory")
@CrossOrigin(origins = "http://localhost:5173")
public class DirectoryController {

    private final DirectoryService directoryService;

    public DirectoryController(DirectoryService directoryService) {
        this.directoryService = directoryService;
    }

    // GET
    // /api/directory/search?type=LAWYER&name=...&state=...&district=...&specialization=...&page=0&size=10
    @GetMapping("/search")
    public Page<DirectoryEntry> search(
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "district", required = false) String district,
            @RequestParam(name = "specialization", required = false) String specialization,
            @RequestParam(name = "minExperience", required = false) Integer minExperience,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        // Sanitize: convert empty/blank strings to null for better matching in
        // Repository
        String sType = (type != null && !type.trim().isEmpty()) ? type.trim() : null;
        String sName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
        String sState = (state != null && !state.trim().isEmpty()) ? state.trim() : null;
        String sDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : null;
        String sSpec = (specialization != null && !specialization.trim().isEmpty()) ? specialization.trim() : null;

        System.out.println("DEBUG_SERVICE_V3 [" + java.time.LocalDateTime.now() + "] name=" + sName + ", type=" + sType
                + ", district=" + sDistrict);
        System.out.println("DEBUG_SERVICE_V3 Total in DB: " + directoryService.countTotal());

        Page<DirectoryEntry> results = directoryService.search(sType, sName, sState,
                sDistrict, sSpec, minExperience, page, size);
        System.out.println("DEBUG_SERVICE_V3 Results size: " + results.getNumberOfElements());
        return results;
    }

    // GET /api/directory/{id}
    @GetMapping("/{id}")
    public DirectoryEntry getById(@PathVariable("id") Integer id) {
        return directoryService.getById(id);
    }
}
