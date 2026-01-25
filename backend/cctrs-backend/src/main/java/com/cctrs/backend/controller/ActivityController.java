package com.cctrs.backend.controller;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.service.ActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ActivityController handles all activity-related API endpoints
 * Endpoints: /api/activities
 *
 * Activity workflow:
 * 1. User submits activity (POST /api/activities) - Status: PENDING
 * 2. Admin approves activity (PUT /api/activities/approve/{id}) - Status: APPROVED
 * 3. Points are automatically added to user on approval
 */
@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private static final Logger logger = LoggerFactory.getLogger(ActivityController.class);
    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    /**
     * Submit a new eco-friendly activity
     * @param activity Activity details (userId, activityType, points)
     * @return Created activity with generated ID and PENDING status
     *
     * Validation:
     * - userId: required, must be valid existing user
     * - activityType: required, not empty
     * - points: required, non-negative integer
     *
     * Default values:
     * - status: PENDING
     * - createdAt: current timestamp (auto-set if not provided)
     *
     * @throws IllegalArgumentException if validation fails
     */
    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {

        // Validate required fields
        if (activity.getUserId() == null || activity.getUserId() <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (activity.getActivityType() == null || activity.getActivityType().trim().isEmpty()) {
            throw new IllegalArgumentException("Activity type is required");
        }
        if (activity.getPoints() == null || activity.getPoints() < 0) {
            throw new IllegalArgumentException("Points must be a non-negative number");
        }

        // Set default values
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(LocalDateTime.now());
        }

        Activity savedActivity = activityService.createActivity(activity);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedActivity);
    }

    /**
     * Retrieve all activities from the system
     * @return List of all activities (any status)
     */
    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities() {
        List<Activity> activities = activityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    /**
     * Retrieve all activities submitted by a specific user
     * @param userId User ID
     * @return List of activities by user (any status)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Activity>> getUserActivities(@PathVariable Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }

        List<Activity> activities = activityService.getActivitiesByUser(userId);
        return ResponseEntity.ok(activities);
    }

    /**
     * Retrieve all activities with a specific status
     * @param status Activity status (PENDING, APPROVED)
     * @return List of activities with given status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Activity>> getActivitiesByStatus(@PathVariable String status) {

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid status is required");
        }

        if (!status.equals("PENDING") && !status.equals("APPROVED")) {
            throw new IllegalArgumentException("Status must be PENDING or APPROVED");
        }

        List<Activity> activities = activityService.getActivitiesByStatus(status);
        return ResponseEntity.ok(activities);
    }

    /**
     * Admin approves an activity and adds points to user
     *
     * This endpoint:
     * 1. Changes activity status from PENDING to APPROVED
     * 2. Adds activity points to user's total points
     *
     * Example: Activity has 50 points
     *   Before: User.points = 20
     *   After approval: User.points = 70
     *
     * @param id Activity ID
     * @return Success message
     * @throws ResponseEntity.notFound() if activity doesn't exist
     */
    @PutMapping("/approve/{id}")
    public ResponseEntity<MessageResponse> approveActivity(@PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }

        activityService.approveActivity(id);
        return ResponseEntity.ok(new MessageResponse("Activity approved and points added to user"));
    }

    /**
     * Helper class for response messages
     */
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
