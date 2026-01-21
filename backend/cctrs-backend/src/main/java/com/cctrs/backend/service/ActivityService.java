package com.cctrs.backend.service;

import com.cctrs.backend.dto.ActivityRequestDto;
import com.cctrs.backend.entity.Activity;
import com.cctrs.backend.entity.User;
import com.cctrs.backend.repository.ActivityRepository;
import com.cctrs.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository,
                           UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    // USER submits activity
    public Activity submitActivity(ActivityRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Activity activity = new Activity(
                user,
                dto.getActivityType(),
                dto.getPoints(),
                dto.getMonth()
        );

        return activityRepository.save(activity);
    }

    // ADMIN views pending activities
    public List<Activity> getPendingActivities() {
        return activityRepository.findByStatus("PENDING");
    }

    // ADMIN approves activity
    public Activity approveActivity(Long activityId) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        activity.approve();
        return activityRepository.save(activity);
    }
}
