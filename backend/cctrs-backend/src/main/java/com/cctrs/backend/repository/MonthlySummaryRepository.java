package com.cctrs.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * MonthlySummaryRepository handles database operations for monthly summaries
 * Uses JDBC for direct SQL operations
 */
@Repository
public class MonthlySummaryRepository {

    private final JdbcTemplate jdbcTemplate;

    public MonthlySummaryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Get monthly summary for a user
     * @param userId User ID
     * @param yearMonth Year-Month in YYYY-MM format
     * @return Monthly summary data
     */
    public int getMonthlyPointsForUser(Long userId, String yearMonth) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (yearMonth == null || yearMonth.trim().isEmpty()) {
            throw new IllegalArgumentException("Valid yearMonth is required");
        }

        // H2-compatible SQL query for monthly summaries
        // Format: YYYY-MM
        String sql = "SELECT COALESCE(SUM(a.points), 0) as total_points " +
                    "FROM activities a " +
                    "WHERE a.user_id = ? " +
                    "AND a.status = 'APPROVED' " +
                    "AND YEAR(a.created_at) = YEAR(CAST(? || '-01' AS DATE)) " +
                    "AND MONTH(a.created_at) = MONTH(CAST(? || '-01' AS DATE))";

        try {
            Integer result = jdbcTemplate.queryForObject(sql, Integer.class, userId, yearMonth, yearMonth);
            return result != null ? result : 0;
        } catch (Exception e) {
            // Fallback: return 0 if query fails
            return 0;
        }
    }
}

