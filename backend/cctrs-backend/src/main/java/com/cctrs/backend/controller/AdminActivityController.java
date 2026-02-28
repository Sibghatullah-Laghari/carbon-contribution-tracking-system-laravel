package com.cctrs.backend.controller;

import com.cctrs.backend.dto.AdminActivityDto;
import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.model.Activity;
import com.cctrs.backend.dto.RejectionRequest;
import com.cctrs.backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/activities")
public class AdminActivityController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AdminActivityController.class);
    private final ActivityService activityService;

    public AdminActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    /**
     * Retrieve all activities in the system for admin review
     * Path: GET /admin/activities
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Get all activities for admin review")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminActivityDto>>> getAllActivitiesForAdmin() {
        logger.info("Admin fetching all activities for review");
        List<AdminActivityDto> activities = activityService.getAllActivitiesWithUser();
        return ResponseEntity.ok(ApiResponse.success("All activities retrieved for admin", activities));
    }

    /**
     * Admin approves an activity and adds points to user
     * Path: PUT /admin/activities/approve/{id}
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Approve an activity")
    @PutMapping("/approve/{id}")
    public ResponseEntity<ApiResponse<Void>> approveActivity(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }

        logger.info("Admin approving activity ID: {}", id);
        activityService.approveActivity(id);
        return ResponseEntity.ok(ApiResponse.success("Activity approved and points added to user", null));
    }

    /**
     * Admin rejects an activity
     * Path: PUT /admin/activities/reject/{id}
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Reject an activity")
    @PutMapping("/reject/{id}")
    public ResponseEntity<ApiResponse<Void>> rejectActivity(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody(required = false) RejectionRequest request) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }

        String reason = (request != null) ? request.getReason() : null;
        logger.info("Admin rejecting activity ID: {}", id);
        activityService.rejectActivity(id, reason);
        return ResponseEntity.ok(
                ApiResponse.success("Activity rejected and user notified", null));
    }

    /**
     * Admin permanently deletes an activity.
     * Path: DELETE /admin/activities/{id}
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Delete an activity (admin-only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Valid activity ID is required");
        }
        logger.info("Admin deleting activity ID: {}", id);
        activityService.deleteActivity(id);
        return ResponseEntity.ok(ApiResponse.success("Activity deleted successfully", null));
    }
}
