package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ActivityRequestDto;
import com.cctrs.backend.dto.MonthlyStatusDto;
import com.cctrs.backend.entity.Activity;
import com.cctrs.backend.entity.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.ActivityService;
import com.cctrs.backend.service.MonthlySummaryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ActivityController {

    private final ActivityService activityService;
    private final MonthlySummaryService summaryService;
    private final UserRepository userRepository;

    public ActivityController(ActivityService activityService,
                              MonthlySummaryService summaryService,
                              UserRepository userRepository) {
        this.activityService = activityService;
        this.summaryService = summaryService;
        this.userRepository = userRepository;
    }

    // USER submits activity
    @PostMapping("/activities/submit")
    public Activity submitActivity(@RequestBody ActivityRequestDto dto) {
        return activityService.submitActivity(dto);
    }

    // USER checks monthly status
    @GetMapping("/users/{userId}/status/{month}")
    public MonthlyStatusDto getMonthlyStatus(@PathVariable Long userId,
                                             @PathVariable String month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return summaryService.calculateMonthlyStatus(user, month);
    }
}
