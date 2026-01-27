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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * ActivityController handles all activity-related API endpoints
 * Endpoints: /api/activities
 *
 * Activity workflow:
 * 1. User submits activity (POST /api/activities) - Status: PENDING
 * 2. Admin approves activity (PUT /api/activities/approve/{id}) - Status:
 * APPROVED
 * - Points are automatically added to user
 * - Approval email is sent to user
 * 3. Admin rejects activity (PUT /api/activities/reject/{id}) - Status:
 * REJECTED
 * - Optional rejection reason can be provided
 * - Rejection email is sent to user with reason
 */
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

    /**
     * Submit a new eco-friendly activity
     * 
     * @param requestDto Activity details
     * @return Created activity
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Submit a new activity")
    @PostMapping
    public ResponseEntity<ApiResponse<Activity>> createActivity(
            @jakarta.validation.Valid @RequestBody com.cctrs.backend.dto.ActivityRequestDto requestDto) {

        // Extract user from JWT
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        logger.info("User {} creating activity: {}", email, requestDto.getActivityType());

        String activityType = requestDto.getActivityType();
        if (activityType != null) {
            try {
                activityType = ActivityType.valueOf(activityType).getDisplayName();
            } catch (IllegalArgumentException ignored) {
            }
        }

        Integer points = requestDto.getPoints();
        if (points == null) {
            points = 0;
        }

        Integer declaredQuantity = requestDto.getDeclaredQuantity();
        if (declaredQuantity == null) {
            declaredQuantity = 1;
        }

        Activity activity = new Activity();
        activity.setUserId(user.getId());
        activity.setActivityType(activityType);
        activity.setPoints(points);
        activity.setDescription(requestDto.getDescription());
        activity.setDeclaredQuantity(declaredQuantity);
        activity.setCreatedAt(LocalDateTime.now());

        // Use declareActivity for the new flow (Stage 1)
        Activity savedActivity = activityService.declareActivity(activity);
        logger.info("Activity created successfully with ID: {}", savedActivity.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Activity declared successfully", savedActivity));
    }

    /**
     * Stage 2: Submit Proof for an Activity
     */
    @PostMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<String>> submitProof(
            @PathVariable Long id,
            @RequestParam(required = false) String proofImage,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestBody(required = false) Map<String, Object> body) {

        // Extract user from JWT
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Verify ownership handled in service or here.
        // Best to fetch activity here or pass owner ID to service to verify.
        // Let's pass user.getId() to service to verify ownership.

        String resolvedProofImage = proofImage;
        Double resolvedLatitude = latitude;
        Double resolvedLongitude = longitude;

        if (body != null) {
            if (resolvedProofImage == null && body.get("proofImage") != null) {
                resolvedProofImage = body.get("proofImage").toString();
            }
            if (resolvedLatitude == null && body.get("latitude") != null) {
                Object value = body.get("latitude");
                resolvedLatitude = value instanceof Number ? ((Number) value).doubleValue()
                        : Double.valueOf(value.toString());
            }
            if (resolvedLongitude == null && body.get("longitude") != null) {
                Object value = body.get("longitude");
                resolvedLongitude = value instanceof Number ? ((Number) value).doubleValue()
                        : Double.valueOf(value.toString());
            }
        }

        if (resolvedProofImage == null || resolvedLatitude == null || resolvedLongitude == null) {
            throw new IllegalArgumentException("proofImage, latitude, and longitude are required");
        }

        activityService.submitProof(id, user.getId(), resolvedProofImage, resolvedLatitude, resolvedLongitude,
                LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.success("Proof submitted successfully", "PROOF_SUBMITTED"));
    }

    /**
     * Retrieve all activities from the system
     * 
     * @return List of all activities (any status)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Activity>>> getAllActivities() {
        List<Activity> activities = activityService.getAllActivities();
        return ResponseEntity.ok(ApiResponse.success("All activities retrieved", activities));
    }

    /**
     * Retrieve all activities submitted by the logged-in user
     * 
     * @return List of activities by user (any status)
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<Activity>>> getUserActivities() {

        // Extract user from JWT
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        List<Activity> activities = activityService.getActivitiesByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success("User activities retrieved", activities));
    }

    /**
     * Retrieve all activities with a specific status
     * 
     * @param status Activity status (PENDING, APPROVED)
     * @return List of activities with given status
     */
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
