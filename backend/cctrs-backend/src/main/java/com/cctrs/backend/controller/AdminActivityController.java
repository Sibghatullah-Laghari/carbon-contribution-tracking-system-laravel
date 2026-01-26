package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.dto.RejectionRequest;
import com.cctrs.backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/activities")
public class AdminActivityController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AdminActivityController.class);
    private final ActivityService activityService;

    public AdminActivityController(ActivityService activityService) {
        this.activityService = activityService;
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
}
