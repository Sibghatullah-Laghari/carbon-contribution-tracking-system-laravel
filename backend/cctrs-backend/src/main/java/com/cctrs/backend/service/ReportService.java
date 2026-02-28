package com.cctrs.backend.service;

import com.cctrs.backend.dto.MonthlySummaryDTO;
import com.cctrs.backend.dto.MonthlyGraphDTO;
import com.cctrs.backend.dto.ProgressGraphDTO;
import com.cctrs.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
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
    public MonthlySummaryDTO getMonthlySummary(Long userId, int month, int year) {
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
    public MonthlyGraphDTO getMonthlyGraph(Long userId, int year) {
        List<Integer> monthlyData = activityRepository.getMonthWisePoints(userId, year);
        return new MonthlyGraphDTO(year, monthlyData);
    }

    /**
     * Flexible progress graph — supports MONTH / DAY / HOUR granularity
     * with optional date range, activity type and status filters.
     *
     * @param userId       mandatory user id
     * @param fromDate     ISO date string "YYYY-MM-DD" (inclusive), null = start of current month
     * @param toDate       ISO date string "YYYY-MM-DD" (exclusive), null = end of current month
     * @param granularity  "MONTH" | "DAY" | "HOUR" (default MONTH)
     * @param activityType optional activity type filter
     * @param status       optional status filter (defaults to APPROVED)
     */
    public ProgressGraphDTO getProgressGraph(Long userId,
                                             String fromDate,
                                             String toDate,
                                             String granularity,
                                             String activityType,
                                             String status) {
        // Resolve defaults
        if (granularity == null || granularity.isBlank()) {
            granularity = "MONTH";
        }

        LocalDateTime from = null;
        LocalDateTime to = null;

        if (fromDate != null && !fromDate.isBlank()) {
            from = LocalDate.parse(fromDate).atStartOfDay();
        }
        if (toDate != null && !toDate.isBlank()) {
            // make upper bound exclusive by adding one day
            to = LocalDate.parse(toDate).plusDays(1).atStartOfDay();
        }

        // For MONTH granularity with no date range, default to the current calendar year
        if (from == null && to == null && "MONTH".equalsIgnoreCase(granularity)) {
            int year = java.time.Year.now().getValue();
            from = LocalDate.of(year, 1, 1).atStartOfDay();
            to = LocalDate.of(year + 1, 1, 1).atStartOfDay();
        }

        return activityRepository.getProgressGraph(userId, from, to, granularity, activityType, status);
    }
}
