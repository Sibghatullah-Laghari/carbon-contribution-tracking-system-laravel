package com.cctrs.backend.controller;

import com.cctrs.backend.entity.Activity;
import com.cctrs.backend.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ActivityService activityService;

    public AdminController(ActivityService activityService) {
        this.activityService = activityService;
    }

    // ADMIN views all pending activities
    @GetMapping("/pending-activities")
    public List<Activity> getPendingActivities() {
        return activityService.getPendingActivities();
    }

    // ADMIN approves an activity
    @PostMapping("/approve/{activityId}")
    public Activity approveActivity(@PathVariable Long activityId) {
        return activityService.approveActivity(activityId);
    }
}
