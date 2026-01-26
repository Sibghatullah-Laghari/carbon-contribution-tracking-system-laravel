package com.cctrs.backend.controller;

import com.cctrs.backend.model.Activity;
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

        Activity activity = new Activity();
        activity.setUserId(user.getId());
        activity.setActivityType(requestDto.getActivityType());
        activity.setPoints(requestDto.getPoints());
        activity.setCreatedAt(LocalDateTime.now());

        Activity savedActivity = activityService.createActivity(activity);
        logger.info("Activity created successfully with ID: {}", savedActivity.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Activity submitted successfully", savedActivity));
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

        if (!status.equals("PENDING") && !status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException("Status must be PENDING, APPROVED, or REJECTED");
        }

        List<Activity> activities = activityService.getActivitiesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved by status", activities));
    }

    /* Admin endpoints have been moved to AdminActivityController for security */
}
