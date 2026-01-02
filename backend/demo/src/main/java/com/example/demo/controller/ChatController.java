package com.example.demo.controller;

import com.example.demo.entity.ChatMessage;
import com.example.demo.entity.ChatSession;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.ChatSessionRepository;
import com.example.demo.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    private final com.example.demo.service.MatchingService matchingService;

    public ChatController(ChatSessionRepository chatSessionRepository,
            ChatMessageRepository chatMessageRepository,
            SimpMessagingTemplate messagingTemplate,
            JwtUtil jwtUtil,
            com.example.demo.service.MatchingService matchingService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
        this.jwtUtil = jwtUtil;
        this.matchingService = matchingService;
    }

    private Integer extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        try {
            return jwtUtil.extractClaim(token, claims -> claims.get("userId", Integer.class));
        } catch (Exception e) {
            return null;
        }
    }

    private String extractUserRole(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        try {
            return jwtUtil.extractRole(token);
        } catch (Exception e) {
            return null;
        }
    }

    // Create a new chat session (only if matched)
    @PostMapping("/sessions")
    public ResponseEntity<?> createSession(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> requestData) {
        try {
            Integer userId = extractUserId(authHeader);
            String role = extractUserRole(authHeader);
            if (userId == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

            if (!"CITIZEN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only citizens can initiate chat sessions");
            }

            Long caseId = Long.valueOf(requestData.get("caseId").toString());
            Integer providerId = Integer.valueOf(requestData.get("providerId").toString());
            String providerRole = requestData.get("providerRole").toString(); // LAWYER or NGO

            // Verify if provider is a match
            Map<String, Object> matches = matchingService.findMatchesForCase(caseId);
            boolean isMatched = false;

            if ("LAWYER".equalsIgnoreCase(providerRole)) {
                List<com.example.demo.entity.Lawyer> lawyers = (List<com.example.demo.entity.Lawyer>) matches
                        .get("lawyers");
                if (lawyers != null) {
                    isMatched = lawyers.stream().anyMatch(l -> l.getId().equals(providerId));
                }
            } else if ("NGO".equalsIgnoreCase(providerRole)) {
                List<com.example.demo.entity.NGO> ngos = (List<com.example.demo.entity.NGO>) matches.get("ngos");
                if (ngos != null) {
                    isMatched = ngos.stream().anyMatch(n -> n.getId().equals(providerId));
                }
            }

            if (!isMatched) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Chat can only be started with matched legal providers");
            }

            // Check if session already exists
            Optional<ChatSession> existing = chatSessionRepository
                    .findByCaseIdAndCitizenIdAndProviderIdAndProviderRole(caseId, userId, providerId, providerRole);
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }

            // Create new session
            ChatSession session = new ChatSession();
            session.setCaseId(caseId);
            session.setCitizenId(userId);
            session.setProviderId(providerId);
            session.setProviderRole(providerRole);

            return ResponseEntity.ok(chatSessionRepository.save(session));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating session: " + e.getMessage());
        }
    }

    // Get all sessions for current user
    @GetMapping("/my-sessions")
    public ResponseEntity<?> getMySessions(@RequestHeader("Authorization") String authHeader) {
        Integer userId = extractUserId(authHeader);
        String role = extractUserRole(authHeader);
        if (userId == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");

        if ("CITIZEN".equalsIgnoreCase(role)) {
            return ResponseEntity.ok(chatSessionRepository.findByCitizenId(userId));
        } else {
            return ResponseEntity.ok(chatSessionRepository.findByProviderIdAndProviderRole(userId, role.toUpperCase()));
        }
    }

    // Get message history for a session
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId));
    }

    // WebSocket Message Handling
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Broadcast to the specific session topic
        messagingTemplate.convertAndSend("/topic/session." + chatMessage.getSessionId(), saved);
    }
}
