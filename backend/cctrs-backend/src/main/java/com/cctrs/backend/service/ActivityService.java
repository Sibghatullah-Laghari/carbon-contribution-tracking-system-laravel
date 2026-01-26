package com.cctrs.backend.service;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.ActivityRepository;
import com.cctrs.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);

    private final ActivityRepository activityRepository;
    private final UserService userService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository,
            UserService userService,
            EmailService emailService,
            UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.userRepository = userRepository;
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
                activity.getPoints());

        // Send approval email notification
        try {
            User user = userRepository.findById(activity.getUserId());
            if (user != null && user.getEmail() != null) {
                emailService.sendApprovalEmail(user.getEmail(), activity.getActivityType());
                logger.info("Approval notification sent for activity ID: {} to user: {}", activityId, user.getEmail());
            } else {
                logger.warn("Could not send approval email - user or email not found for activity ID: {}", activityId);
            }
        } catch (Exception e) {
            logger.error("Error sending approval email for activity ID: {}. Error: {}", activityId, e.getMessage());
            // Don't throw exception - email failure shouldn't block approval
        }
    }

    // Admin rejects activity
    public void rejectActivity(Long activityId, String rejectionReason) {

        // Validate activityId
        if (activityId == null || activityId <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }

        // Fetch the activity by ID first
        Activity activity = activityRepository.findById(activityId);

        if (activity == null) {
            throw new IllegalArgumentException("Activity not found with ID: " + activityId);
        }

        // Check if already rejected
        if ("REJECTED".equals(activity.getStatus())) {
            throw new IllegalArgumentException("Activity is already rejected");
        }

        // Check if already approved
        if ("APPROVED".equals(activity.getStatus())) {
            throw new IllegalArgumentException("Cannot reject an already approved activity");
        }

        // Update status to REJECTED
        activityRepository.updateStatus(activityId, "REJECTED");

        // Store rejection reason if provided
        if (rejectionReason != null && !rejectionReason.trim().isEmpty()) {
            activityRepository.updateRejectionReason(activityId, rejectionReason);
        }

        // Send rejection email notification
        try {
            User user = userRepository.findById(activity.getUserId());
            if (user != null && user.getEmail() != null) {
                emailService.sendRejectionEmailWithReason(user.getEmail(), activity.getActivityType(), rejectionReason);
                logger.info("Rejection notification sent for activity ID: {} to user: {}", activityId, user.getEmail());
            } else {
                logger.warn("Could not send rejection email - user or email not found for activity ID: {}", activityId);
            }
        } catch (Exception e) {
            logger.error("Error sending rejection email for activity ID: {}. Error: {}", activityId, e.getMessage());
            // Don't throw exception - email failure shouldn't block rejection
        }
    }
}
