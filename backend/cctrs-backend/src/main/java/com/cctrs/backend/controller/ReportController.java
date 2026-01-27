package com.cctrs.backend.controller;

import com.cctrs.backend.dto.ApiResponse;
import com.cctrs.backend.dto.MonthlySummaryDTO;
import com.cctrs.backend.dto.MonthlyGraphDTO;
import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.UserRepository;
import com.cctrs.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ReportController handles monthly report endpoints
 */
@RestController
@RequestMapping({ "/report", "/api/report" })
public class ReportController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(ReportController.class);
    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    /**
     * Get monthly summary report with badge
     * 
     * @param month Month (1-12)
     * @param year  Year
     * @return Monthly summary with total points, monthly points, activity count,
     *         carbon estimate, and badge
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Get monthly summary report")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MonthlySummaryDTO>> getSummary(
            @RequestParam int month,
            @RequestParam int year) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        logger.info("Generating summary report for user: {} (Month: {}, Year: {})", email, month, year);
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        MonthlySummaryDTO summary = reportService.getMonthlySummary(
                user.getId(), month, year);
        return ResponseEntity.ok(ApiResponse.success("Monthly summary retrieved", summary));
    }

    /**
     * Get monthly graph data for the year
     * 
     * @param year Year
     * @return Graph data with 12 months of points
     */
    @io.swagger.v3.oas.annotations.Operation(summary = "Get monthly graph data")
    @GetMapping("/graph")
    public ResponseEntity<ApiResponse<MonthlyGraphDTO>> getGraph(@RequestParam int year) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        MonthlyGraphDTO graph = reportService.getMonthlyGraph(
                user.getId(), year);
        return ResponseEntity.ok(ApiResponse.success("Monthly graph data retrieved", graph));
    }
}
