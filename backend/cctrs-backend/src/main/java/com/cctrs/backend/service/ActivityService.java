package com.cctrs.backend.service;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserService userService;

    public ActivityService(ActivityRepository activityRepository,
                           UserService userService) {
        this.activityRepository = activityRepository;
        this.userService = userService;
    }

    // User submits activity
    public Activity createActivity(Activity activity) {

        // Validation
        if (activity.getUserId() == null || activity.getUserId() <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (activity.getActivityType() == null || activity.getActivityType().trim().isEmpty()) {
            throw new IllegalArgumentException("Activity type is required");
        }
        if (activity.getPoints() == null || activity.getPoints() < 0) {
            throw new IllegalArgumentException("Points must be a non-negative number");
        }

        // Verify user exists
        try {
            userService.getUserById(activity.getUserId());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("User not found with ID: " + activity.getUserId());
        }

        // Set default status
        activity.setStatus("PENDING");

        // Set timestamp if not provided
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(LocalDateTime.now());
        }

        return activityRepository.save(activity);
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public List<Activity> getActivitiesByUser(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        return activityRepository.findByUserId(userId);
    }

    public List<Activity> getActivitiesByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid status is required");
        }
        return activityRepository.findByStatus(status);
    }

    // Admin approves activity
    public void approveActivity(Long activityId) {

        // Validate activityId
        if (activityId == null || activityId <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }

        // Fetch the activity by ID first
        Activity activity = activityRepository.findById(activityId);

        if (activity == null) {
            throw new IllegalArgumentException("Activity not found with ID: " + activityId);
        }

        // Check if already approved
        if ("APPROVED".equals(activity.getStatus())) {
            throw new IllegalArgumentException("Activity is already approved");
        }

        // Update status
        activityRepository.updateStatus(activityId, "APPROVED");

        // Add points to user
        userService.addPointsToUser(
                activity.getUserId(),
                activity.getPoints()
        );
    }
}
