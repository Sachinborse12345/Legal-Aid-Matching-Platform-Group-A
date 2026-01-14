package com.example.demo.service;

import com.example.demo.entity.Appointment;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.LawyerUnavailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final com.example.demo.repository.LawyerRepository lawyerRepository;
    private final com.example.demo.repository.NGORepository ngoRepository;
    private final com.example.demo.repository.CitizenRepository citizenRepository;
    private final com.example.demo.service.EmailService emailService;
    private final LawyerUnavailabilityRepository lawyerUnavailabilityRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, NotificationService notificationService,
            com.example.demo.repository.LawyerRepository lawyerRepository,
            com.example.demo.repository.NGORepository ngoRepository,
            com.example.demo.repository.CitizenRepository citizenRepository,
            com.example.demo.service.EmailService emailService,
            LawyerUnavailabilityRepository lawyerUnavailabilityRepository) {
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.lawyerRepository = lawyerRepository;
        this.ngoRepository = ngoRepository;
        this.citizenRepository = citizenRepository;
        this.emailService = emailService;
        this.lawyerUnavailabilityRepository = lawyerUnavailabilityRepository;
    }

    public Appointment scheduleAppointment(Appointment appointment) {
        // Normalize roles to uppercase
        if (appointment.getProviderRole() != null) {
            appointment.setProviderRole(appointment.getProviderRole().toUpperCase());
        }
        if (appointment.getRequesterRole() != null) {
            appointment.setRequesterRole(appointment.getRequesterRole().toUpperCase());
        }

        // For lawyers, check if they have marked this time as unavailable
        if ("LAWYER".equalsIgnoreCase(appointment.getProviderRole())) {
            List<com.example.demo.entity.LawyerUnavailability> unavailabilityPeriods = 
                lawyerUnavailabilityRepository.findByLawyerIdAndStartTimeLessThanAndEndTimeGreaterThan(
                    appointment.getProviderId(),
                    appointment.getEndTime(),
                    appointment.getStartTime());
            
            if (!unavailabilityPeriods.isEmpty()) {
                throw new IllegalArgumentException("The lawyer is not available during this time period. Please select another time slot.");
            }
        }

        // Validate overlaps - check for CONFIRMED or PENDING appointments that would block this slot
        List<Appointment> conflicts = appointmentRepository.findOverlappingAppointments(
                appointment.getProviderId(),
                appointment.getProviderRole(),
                appointment.getStartTime(),
                appointment.getEndTime());

        if (!conflicts.isEmpty()) {
            // Check if any conflicting appointment is already CONFIRMED
            boolean hasConfirmed = conflicts.stream()
                    .anyMatch(a -> "CONFIRMED".equalsIgnoreCase(a.getStatus()));
            
            if (hasConfirmed) {
                throw new IllegalArgumentException("This time slot is already confirmed and booked. Please select another time.");
            }
            throw new IllegalArgumentException("Provider is not available at the selected time.");
        }

        // Validate requester overlaps (Citizen-side conflict)
        System.err.println("!!! CONFLICT CHECK START !!!");
        System.err.println(
                "New Appt Requester: ID=" + appointment.getRequesterId() + ", Role=" + appointment.getRequesterRole());
        System.err.println("New Appt Time: " + appointment.getStartTime() + " to " + appointment.getEndTime());

        // DEBUG: Print all appointments for this requester
        List<Appointment> allUserAppts = appointmentRepository.findByRequesterIdAndRequesterRole(
                appointment.getRequesterId(), appointment.getRequesterRole());
        System.err.println("Database total appts for this user: " + allUserAppts.size());
        for (Appointment a : allUserAppts) {
            System.err.println("  - DB Appt ID=" + a.getId() + ", Time=" + a.getStartTime() + " to " + a.getEndTime()
                    + ", Status=" + a.getStatus());
        }

        List<Appointment> requesterConflicts = appointmentRepository.findRequesterOverlappingAppointments(
                appointment.getRequesterId(),
                appointment.getRequesterRole(),
                appointment.getStartTime(),
                appointment.getEndTime());

        System.err.println("Found Conflicts Count: " + requesterConflicts.size());
        if (!requesterConflicts.isEmpty()) {
            for (Appointment c : requesterConflicts) {
                System.err.println("Conflict with ID: " + c.getId() + ", Time: " + c.getStartTime() + " - "
                        + c.getEndTime() + ", Status: " + c.getStatus());
            }
        }

        // We check for a specific "IGNORE_CONFLICT" string in the description or a new
        // field.
        // For simplicity, let's look for "[FORCE]" at the start of the description if
        // we want to allow override.
        boolean forceOverride = appointment.getDescription() != null
                && appointment.getDescription().startsWith("[FORCE]");

        System.err.println("Force Override: " + forceOverride);

        if (!requesterConflicts.isEmpty() && !forceOverride) {
            Appointment existing = requesterConflicts.get(0);
            String providerName = existing.getProviderName() != null ? existing.getProviderName() : "another provider";
            String errorMsg = "REACTION_REQUIRED: You already have a slot booked with " + providerName
                    + ". Do you want to book this slot with this lawyer?";
            System.err.println("THROWING CONFLICT: " + errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }
        System.err.println("!!! CONFLICT CHECK END (NO CONFLICT) !!!");

        // Populate Names
        if (appointment.getProviderRole().equalsIgnoreCase("LAWYER")) {
            lawyerRepository.findById(appointment.getProviderId())
                    .ifPresent(l -> appointment.setProviderName(l.getFullName()));
        } else if (appointment.getProviderRole().equalsIgnoreCase("NGO")) {
            ngoRepository.findById(appointment.getProviderId())
                    .ifPresent(n -> appointment.setProviderName(n.getNgoName()));
        }

        if (appointment.getRequesterRole().equalsIgnoreCase("CITIZEN")) {
            citizenRepository.findById(appointment.getRequesterId())
                    .ifPresent(c -> appointment.setRequesterName(c.getFullName()));
        }

        // Set appointment status to PENDING so lawyer can confirm/reject
        appointment.setStatus("PENDING");
        Appointment saved = appointmentRepository.save(appointment);

        // Format date and time for notification
        String dateStr = appointment.getStartTime().toLocalDate().toString();
        String timeStr = appointment.getStartTime().toLocalTime().toString();
        String requesterName = appointment.getRequesterName() != null ? appointment.getRequesterName() : "a citizen";
        
        // Notify Provider (Lawyer/NGO) with detailed information
        String providerMessage = String.format("New appointment request from %s on %s at %s. Please confirm or reject.",
                requesterName, dateStr, timeStr);
        notificationService.createNotification(
                appointment.getProviderId(),
                appointment.getProviderRole(),
                providerMessage,
                "APPOINTMENT",
                saved.getId());

        // Notify Citizen that appointment request has been sent
        String citizenMessage = String.format("Appointment request sent to %s for %s at %s. Waiting for confirmation.",
                appointment.getProviderName() != null ? appointment.getProviderName() : "lawyer",
                dateStr, timeStr);
        notificationService.createNotification(
                appointment.getRequesterId(),
                appointment.getRequesterRole(),
                citizenMessage,
                "APPOINTMENT",
                saved.getId());

        // Send Email Notification to Provider
        try {
            String providerEmail = "";
            String requesterEmail = "";

            if (appointment.getProviderRole().equalsIgnoreCase("LAWYER")) {
                providerEmail = lawyerRepository.findById(appointment.getProviderId())
                        .map(l -> l.getEmail()).orElse("");
            } else if (appointment.getProviderRole().equalsIgnoreCase("NGO")) {
                providerEmail = ngoRepository.findById(appointment.getProviderId())
                        .map(n -> n.getEmail()).orElse("");
            }

            if (appointment.getRequesterRole().equalsIgnoreCase("CITIZEN")) {
                requesterEmail = citizenRepository.findById(appointment.getRequesterId())
                        .map(c -> c.getEmail()).orElse("");
            }

            if (!providerEmail.isEmpty()) {
                emailService.sendAppointmentNotificationEmail(
                        providerEmail,
                        appointment.getProviderName(),
                        appointment.getProviderRole(),
                        appointment.getRequesterName(),
                        requesterEmail,
                        appointment.getStartTime().toLocalDate().toString(),
                        appointment.getStartTime().toLocalTime().toString(),
                        appointment.getType(),
                        appointment.getDescription());
            }
        } catch (Exception e) {
            System.err.println("Failed to send appointment notification email: " + e.getMessage());
        }

        return saved;
    }

    public List<Appointment> getAppointmentsForProvider(Integer providerId, String providerRole) {
        return appointmentRepository.findByProviderIdAndProviderRole(providerId, providerRole);
    }

    public List<Appointment> getAppointmentsForRequester(Integer requesterId, String requesterRole) {
        return appointmentRepository.findByRequesterIdAndRequesterRole(requesterId, requesterRole);
    }

    public List<Appointment> getAllAppointmentsForUser(Integer userId) {
        return appointmentRepository.findAllByUserId(userId);
    }

    public Appointment updateStatus(Long appointmentId, String status) {
        Optional<Appointment> optional = appointmentRepository.findById(appointmentId);
        if (optional.isPresent()) {
            Appointment appt = optional.get();
            appt.setStatus(status);
            Appointment saved = appointmentRepository.save(appt);

            // Format date and time for notifications
            String dateStr = appt.getStartTime().toLocalDate().toString();
            String timeStr = appt.getStartTime().toLocalTime().toString();
            String requesterName = appt.getRequesterName() != null ? appt.getRequesterName() : "Citizen";
            String providerName = appt.getProviderName() != null ? appt.getProviderName() : "Lawyer";

            if ("CONFIRMED".equalsIgnoreCase(status)) {
                // Notify Citizen that appointment is confirmed
                String citizenMessage = String.format("Your appointment with %s on %s at %s has been confirmed!",
                        providerName, dateStr, timeStr);
                notificationService.createNotification(
                        appt.getRequesterId(),
                        appt.getRequesterRole(),
                        citizenMessage,
                        "APPOINTMENT",
                        saved.getId());

                // Notify Provider (Lawyer) that they confirmed the appointment
                String providerMessage = String.format("You confirmed the appointment with %s on %s at %s.",
                        requesterName, dateStr, timeStr);
                notificationService.createNotification(
                        appt.getProviderId(),
                        appt.getProviderRole(),
                        providerMessage,
                        "APPOINTMENT",
                        saved.getId());
            } else {
                // For REJECTED or other statuses, notify requester
                String requesterMessage = String.format("Your appointment request with %s on %s at %s has been %s.",
                        providerName, dateStr, timeStr, status.toLowerCase());
                notificationService.createNotification(
                        appt.getRequesterId(),
                        appt.getRequesterRole(),
                        requesterMessage,
                        "APPOINTMENT",
                        saved.getId());
            }

            return saved;
        } else {
            throw new RuntimeException("Appointment not found");
        }
    }

    public List<java.util.Map<String, Object>> getAvailability(Integer providerId, String providerRole,
            java.time.LocalDate date, Integer requesterId, String requesterRole) {
        System.out.println("DEBUG: [VERBOSE] getAvailability for Prov=" + providerId + " (" + providerRole + "), Date="
                + date + ", Req=" + requesterId + " (" + requesterRole + ")");
        LocalDateTime dayStart = date.atStartOfDay();
        // Use 9 AM to 5 PM
        LocalDateTime workStart = date.atTime(9, 0);
        LocalDateTime workEnd = date.atTime(17, 0);

        List<Appointment> appts = appointmentRepository.findOverlappingAppointments(providerId, providerRole, workStart,
                workEnd);
        System.out.println("DEBUG: [VERBOSE] Found " + appts.size() + " provider overlaps");

        // Also find requester overlaps if requesterId is provided
        List<Appointment> requesterAppts = (requesterId != null && requesterRole != null)
                ? appointmentRepository.findRequesterOverlappingAppointments(requesterId, requesterRole, workStart,
                        workEnd)
                : new java.util.ArrayList<>();
        System.out.println("DEBUG: [VERBOSE] Found " + requesterAppts.size() + " requester overlaps");
        // For lawyers, check unavailability periods
        List<com.example.demo.entity.LawyerUnavailability> unavailabilityPeriods = new java.util.ArrayList<>();
        if ("LAWYER".equalsIgnoreCase(providerRole)) {
            unavailabilityPeriods = lawyerUnavailabilityRepository
                .findByLawyerIdAndStartTimeLessThanAndEndTimeGreaterThan(
                    providerId, workEnd, workStart);
        }

        List<java.util.Map<String, Object>> slots = new java.util.ArrayList<>();
        for (int hour = 9; hour < 17; hour++) {
            LocalDateTime slotStart = date.atTime(hour, 0);
            LocalDateTime slotEnd = date.atTime(hour + 1, 0);

            boolean isProviderBooked = appts.stream()
                    .anyMatch(appt -> (appt.getStartTime().isBefore(slotEnd) && appt.getEndTime().isAfter(slotStart)));

            // Check if slot is in an unavailability period
            boolean isUnavailable = unavailabilityPeriods.stream()
                    .anyMatch(unav -> (unav.getStartTime().isBefore(slotEnd) && unav.getEndTime().isAfter(slotStart)));

            Optional<Appointment> conflictAppt = requesterAppts.stream()
                    .filter(appt -> (appt.getStartTime().isBefore(slotEnd) && appt.getEndTime().isAfter(slotStart)))
                    .findFirst();

            java.util.Map<String, Object> slot = new java.util.HashMap<>();
            slot.put("time", String.format("%02d:00", hour));
            slot.put("displayTime", String.format("%02d:00 - %02d:00", hour, hour + 1));

            if (isUnavailable) {
                slot.put("status", "UNAVAILABLE");
            } else if (isProviderBooked) {
                slot.put("status", "BOOKED");
            } else if (conflictAppt.isPresent()) {
                slot.put("status", "CONFLICT");
                slot.put("conflictWith", conflictAppt.get().getProviderName());
            } else {
                slot.put("status", "AVAILABLE");
            }

            slots.add(slot);
        }
        return slots;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
