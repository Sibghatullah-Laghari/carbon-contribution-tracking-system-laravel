package com.cctrs.backend.service;

import com.cctrs.backend.dto.MonthlySummaryDTO;
import com.cctrs.backend.dto.MonthlyGraphDTO;
import com.cctrs.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    private final ActivityRepository activityRepository;
    private final UserService userService;

    public ReportService(ActivityRepository activityRepository, UserService userService) {
        this.activityRepository = activityRepository;
        this.userService = userService;
    }

    /**
     * Get monthly summary report with badge
     */
    public MonthlySummaryDTO getMonthlySummary(int userId, int month, int year) {
        int total = activityRepository.getTotalPointsByUser(userId);
        int monthly = activityRepository.getMonthlyPoints(userId, month, year);
        int count = activityRepository.getMonthlyActivityCount(userId, month, year);
        double carbon = total * 0.1; // example conversion
        String badge = userService.calculateBadge(total);

        return new MonthlySummaryDTO(total, monthly, count, carbon, badge, month, year);
    }

    /**
     * Get monthly graph data
     */
    public MonthlyGraphDTO getMonthlyGraph(int userId, int year) {
        List<Integer> monthlyData = activityRepository.getMonthWisePoints(userId, year);
        return new MonthlyGraphDTO(year, monthlyData);
    }
}
