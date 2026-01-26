package com.cctrs.backend.service;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.ActivityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

/**
 * MonthlySummaryService handles monthly activity summaries and status
 * calculations
 */
@Service
public class MonthlySummaryService {

    private static final Logger logger = LoggerFactory.getLogger(MonthlySummaryService.class);
    private final ActivityRepository activityRepository;

    public MonthlySummaryService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    /**
     * Calculate monthly status for a user
     * 
     * @param userId    User ID
     * @param yearMonth Year-Month in format YYYY-MM
     * @return Total approved points for the month
     */
    public int calculateMonthlyStatus(Long userId, String yearMonth) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (yearMonth == null || yearMonth.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid yearMonth (YYYY-MM) is required");
        }

        List<Activity> userActivities = activityRepository.getActivitiesByUser(userId);

        int totalPoints = userActivities.stream()
                .filter(activity -> "APPROVED".equals(activity.getStatus()))
                .filter(activity -> isInMonth(activity.getCreatedAt(), yearMonth))
                .mapToInt(Activity::getPoints)
                .sum();

        logger.info("Monthly status calculated for user {}: {} points in {}", userId, totalPoints, yearMonth);
        return totalPoints;
    }

    /**
     * Check if a LocalDateTime falls within a specific month
     */
    private boolean isInMonth(LocalDateTime dateTime, String yearMonth) {
        if (dateTime == null) {
            return false;
        }
        YearMonth activityMonth = YearMonth.from(dateTime);
        YearMonth targetMonth = YearMonth.parse(yearMonth);
        return activityMonth.equals(targetMonth);
    }
}
