package com.cctrs.backend.service;

import com.cctrs.backend.dto.AdminActivityDto;
import com.cctrs.backend.model.Activity;
import com.cctrs.backend.model.ActivityType;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.ActivityRepository;
import com.cctrs.backend.repository.UserDailyLimitRepository;
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
    private final UserDailyLimitRepository dailyLimitRepository;

    public ActivityService(ActivityRepository activityRepository,
            UserService userService,
            EmailService emailService,
            UserRepository userRepository,
            UserDailyLimitRepository dailyLimitRepository) {
        this.activityRepository = activityRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.dailyLimitRepository = dailyLimitRepository;
    }

    // User declares activity (Stage 1)
    public Activity declareActivity(Activity activity) {
        // Validation
        if (activity.getUserId() == null || activity.getUserId() <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (activity.getActivityType() == null || activity.getActivityType().trim().isEmpty()) {
            throw new IllegalArgumentException("Activity type is required");
        }

        // Check User existence
        userService.getUserById(activity.getUserId());

        // Default verification flag
        String flag = "OK";

        // RULE 1: Daily Limit Check
        // Update daily limits and check bounds
        // For declaration, we increment limits. If limit exceeded -> FLAGGED
        int quantity = activity.getDeclaredQuantity() != null ? activity.getDeclaredQuantity() : 1;

        // Check if total activities exceed limit (Rule: Max 10 activities per day)
        // Need to fetch current count first or rely on repository check logic
        // We will increment first, then check.
        // dailyLimitRepository logic uses void increment. We should update repository
        // or just assume increment works.
        // To be safe and strict, let's fetch daily limit record.

        dailyLimitRepository.incrementActivityCount(activity.getUserId(), java.time.LocalDate.now());

        // Check "Too many activities" rule
        com.cctrs.backend.model.UserDailyLimit limit = dailyLimitRepository.findByUserIdAndDate(activity.getUserId(),
                java.time.LocalDate.now());
        if (limit != null && limit.getActivityCount() > 10) {
            flag = "FLAGGED";
        }

        if (ActivityType.TREE_PLANTATION.getDisplayName().equalsIgnoreCase(activity.getActivityType()) ||
                "Tree Plantation".equalsIgnoreCase(activity.getActivityType())) {
            dailyLimitRepository.incrementTreeCount(activity.getUserId(), java.time.LocalDate.now(), quantity);

            // Check Tree Limit (Rule: Max 5 trees per day)
            // Re-fetch limit to get updated tree count
            limit = dailyLimitRepository.findByUserIdAndDate(activity.getUserId(), java.time.LocalDate.now());
            if (limit != null && limit.getTreesDeclared() > 5) {
                flag = "FLAGGED";
            }
        }

        if (activity.getPoints() == null || activity.getPoints() <= 0) {
            int basePointsPerUnit = 1;
            String type = activity.getActivityType() != null ? activity.getActivityType().toLowerCase() : "";
            if (type.contains("tree")) {
                basePointsPerUnit = 10;
            } else if (type.contains("transport")) {
                basePointsPerUnit = 2;
            } else if (type.contains("recycling")) {
                basePointsPerUnit = 5;
            }
            int computedPoints = quantity * basePointsPerUnit;
            activity.setPoints(computedPoints);
        }

        activity.setStatus("DECLARED");
        activity.setVerificationFlag(flag);

        // Set timestamp if not provided
        if (activity.getCreatedAt() == null) {
            activity.setCreatedAt(LocalDateTime.now());
        }

        return activityRepository.save(activity);
    }

    // Legacy method support (redirects to declareActivity or handles direct
    // creation if needed)
    // Keeping this signature to avoid breaking existing tests if they call
    // createActivity directly
    // But updating logic to match new flow
    public Activity createActivity(Activity activity) {
        return declareActivity(activity);
    }

    // Submit Proof (Stage 2)
    public void submitProof(Long activityId, Long userId, String proofImage, Double lat, Double lon,
            LocalDateTime proofTime) {
        Activity activity = activityRepository.findById(activityId);
        if (activity == null) {
            throw new IllegalArgumentException("Activity not found");
        }

        if (!activity.getUserId().equals(userId)) {
            throw new SecurityException("You are not authorized to submit proof for this activity");
        }

        if (!"DECLARED".equals(activity.getStatus())) {
            throw new IllegalArgumentException("Activity is not in DECLARED state");
        }

        // Update proof details
        // Using repository method or JDBC template directly? ActivityRepository needs
        // an update method or we extend it here.
        // Better to add method in Repository or use setters and save? Repository.save
        // handles INSERT usually.
        // ActivityRepository has updateStatus but not full update.
        // I will add updateProofDetails to ActivityRepository in next step or use a
        // custom query here via the repo?
        // Wait, I can't modify Repo class here. I need to rely on what's available or
        // add to Repo.
        // I'll assume I can add `updateProof` to `ActivityRepository`.
        // For now, let's throw if not implemented, or better, implement `updateProof`
        // implementation in Repo first.
        // Or I can use setters and a `save` if `save` handles updates (check `save`
        // implementation).
        // `save` implementation had `INSERT` SQL. It does NOT handle update.
        // So I must add an update method to ActivityRepository.

        // I'll call a method I will create in ActivityRepository
        activityRepository.submitProof(activityId, proofImage, lat, lon, proofTime);
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    /**
     * Returns all activities enriched with the submitting user's name/email.
     * Used exclusively by the Admin Panel.
     */
    public List<AdminActivityDto> getAllActivitiesWithUser() {
        return activityRepository.findAllWithUser();
    }

    /**
     * Admin deletes an activity permanently.
     */
    public void deleteActivity(Long activityId) {
        if (activityId == null || activityId <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }
        Activity activity = activityRepository.findById(activityId);
        if (activity == null) {
            throw new IllegalArgumentException("Activity not found with ID: " + activityId);
        }
        activityRepository.deleteById(activityId);
        logger.info("Admin deleted activity ID: {}", activityId);
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

        // Ensure Proof is Submitted (Optional: Can admin approve DECLARED without
        // proof? Maybe, but usually needs proof)
        // Prompt says: Stage 3: Admin verification.
        // If status is DECLARED, admin can still approve (maybe overriding proof
        // requirement), or we should enforce.
        // Let's allow approval from any state for Admin flexibility, or warn. I'll
        // stick to logic "Admin approves".

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
