package com.cctrs.backend.controller;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.model.ActivityType;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.ActivityService;
import com.cctrs.backend.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Base64;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private static final Logger logger = LoggerFactory.getLogger(ActivityController.class);
    private final ActivityService activityService;
    private final UserRepository userRepository;

    public ActivityController(ActivityService activityService, UserRepository userRepository) {
        this.activityService = activityService;
        this.userRepository = userRepository;
    }

    @io.swagger.v3.oas.annotations.Operation(summary = "Submit a new activity")
    @PostMapping
    public ResponseEntity<ApiResponse<Activity>> createActivity(
            @jakarta.validation.Valid @RequestBody com.cctrs.backend.dto.ActivityRequestDto requestDto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new IllegalArgumentException("User not authenticated");

        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("User not found");

        logger.info("User {} creating activity: {}", email, requestDto.getActivityType());

        String activityType = requestDto.getActivityType();
        if (activityType != null) {
            try {
                activityType = ActivityType.valueOf(activityType).getDisplayName();
            } catch (IllegalArgumentException ignored) {}
        }

        Integer declaredQuantity = requestDto.getDeclaredQuantity();
        if (declaredQuantity == null) declaredQuantity = 1;

        Activity activity = new Activity();
        activity.setUserId(user.getId());
        activity.setActivityType(activityType);
        activity.setPoints(requestDto.getPoints());
        activity.setDescription(requestDto.getDescription());
        activity.setDeclaredQuantity(declaredQuantity);
        activity.setCreatedAt(LocalDateTime.now());

        Activity savedActivity = activityService.declareActivity(activity);
        logger.info("Activity created successfully with ID: {}", savedActivity.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Activity declared successfully", savedActivity));
    }

    /**
     * Stage 2: Submit Proof for an Activity
     * Accepts multipart/form-data ONLY
     */
    @PostMapping(value = "/{id}/proof", consumes = {
            "multipart/form-data",
            "application/x-www-form-urlencoded"
    })
    public ResponseEntity<ApiResponse<String>> submitProof(
            @PathVariable Long id,
            @RequestParam(required = false) MultipartFile proofImageFile,
            @RequestParam(required = false) String proofImage,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String proofTime) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new IllegalArgumentException("User not authenticated");

        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("User not found");

        String resolvedProofImage = proofImage;
        Double resolvedLatitude = latitude;
        Double resolvedLongitude = longitude;
        LocalDateTime resolvedProofTime = LocalDateTime.now();

        if (proofImageFile != null && !proofImageFile.isEmpty()) {
            try {
                resolvedProofImage = Base64.getEncoder().encodeToString(proofImageFile.getBytes());
            } catch (IOException e) {
                throw new IllegalArgumentException("Unable to read proof image");
            }
        }

        if (proofTime != null && !proofTime.trim().isEmpty()) {
            try {
                resolvedProofTime = LocalDateTime.parse(proofTime);
            } catch (Exception ignored) {}
        }

        if (resolvedProofImage == null || resolvedLatitude == null || resolvedLongitude == null) {
            throw new IllegalArgumentException("proofImage, latitude, and longitude are required");
        }

        activityService.submitProof(id, user.getId(), resolvedProofImage, resolvedLatitude, resolvedLongitude, resolvedProofTime);

        return ResponseEntity.ok(ApiResponse.success("Proof submitted successfully", "PROOF_SUBMITTED"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Activity>>> getAllActivities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new IllegalArgumentException("User not authenticated");

        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("User not found");

        List<Activity> activities = activityService.getActivitiesByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("User activities retrieved", activities));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<Activity>>> getUserActivities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new IllegalArgumentException("User not authenticated");

        String email = auth.getName();
        User user = userRepository.findByEmail(email);
        if (user == null) throw new IllegalArgumentException("User not found");

        List<Activity> activities = activityService.getActivitiesByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("User activities retrieved", activities));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<Activity>>> getActivitiesByStatus(@PathVariable String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid status is required");
        }

        if (!status.equals("PENDING") && !status.equals("APPROVED") && !status.equals("REJECTED")
                && !status.equals("DECLARED") && !status.equals("PROOF_SUBMITTED") && !status.equals("FLAGGED")) {
            throw new IllegalArgumentException(
                    "Status must be one of: DECLARED, PROOF_SUBMITTED, PENDING, APPROVED, REJECTED, FLAGGED");
        }

        List<Activity> activities = activityService.getActivitiesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved by status", activities));
    }

    /* Admin endpoints have been moved to AdminActivityController for security */
}