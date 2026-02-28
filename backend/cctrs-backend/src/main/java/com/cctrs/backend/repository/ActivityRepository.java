package com.cctrs.backend.repository;

import com.cctrs.backend.dto.AdminActivityDto;
import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.mapper.ActivityRowMapper;
import com.cctrs.backend.repository.mapper.AdminActivityDtoRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.cctrs.backend.dto.ProgressGraphDTO;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class ActivityRepository {

    private final JdbcTemplate jdbcTemplate;

    public ActivityRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Activity save(Activity activity) {
        String sql = "INSERT INTO activities (user_id, activity_type, points, status, created_at, description, declared_quantity, verification_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[] { "id" });
            ps.setLong(1, activity.getUserId());
            ps.setString(2, activity.getActivityType());
            ps.setInt(3, activity.getPoints());
            ps.setString(4, activity.getStatus());
            ps.setObject(5, activity.getCreatedAt());
            ps.setString(6, activity.getDescription());
            ps.setInt(7, activity.getDeclaredQuantity() != null ? activity.getDeclaredQuantity() : 0);
            ps.setString(8, activity.getVerificationFlag());
            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKeyAs(Long.class);
        activity.setId(generatedId);

        return activity;
    }

    public Activity findById(Long activityId) {
        List<Activity> activities = jdbcTemplate.query(
                "SELECT * FROM activities WHERE id = ?",
                new ActivityRowMapper(),
                activityId);
        return activities.isEmpty() ? null : activities.get(0);
    }

    public int getTotalPointsByUser(Long userId) {
        String sql = "SELECT COALESCE(SUM(points),0) FROM activities " +
                "WHERE user_id=? AND status='APPROVED'";
        Integer result = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return result != null ? result : 0;
    }

    public int getMonthlyPoints(Long userId, int month, int year) {
        String sql = "SELECT COALESCE(SUM(points),0) FROM activities " +
                "WHERE user_id=? AND status='APPROVED' " +
                "AND EXTRACT(MONTH FROM created_at)=? AND EXTRACT(YEAR FROM created_at)=?";
        Integer result = jdbcTemplate.queryForObject(sql, Integer.class, userId, month, year);
        return result != null ? result : 0;
    }

    public int getMonthlyActivityCount(Long userId, int month, int year) {
        String sql = "SELECT COUNT(*) FROM activities " +
                "WHERE user_id=? AND status='APPROVED' " +
                "AND EXTRACT(MONTH FROM created_at)=? AND EXTRACT(YEAR FROM created_at)=?";
        Integer result = jdbcTemplate.queryForObject(sql, Integer.class, userId, month, year);
        return result != null ? result : 0;
    }

    public List<Integer> getMonthWisePoints(Long userId, int year) {
        String sql = "SELECT EXTRACT(MONTH FROM created_at) as m, COALESCE(SUM(points),0) as p " +
                "FROM activities WHERE user_id=? AND status='APPROVED' " +
                "AND EXTRACT(YEAR FROM created_at)=? " +
                "GROUP BY EXTRACT(MONTH FROM created_at)";

        Map<Integer, Integer> map = new HashMap<>();

        jdbcTemplate.query(sql, rs -> {
            map.put(rs.getInt("m"), rs.getInt("p"));
        }, userId, year);

        List<Integer> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            result.add(map.getOrDefault(i, 0));
        }
        return result;
    }

    /**
     * Flexible progress graph query supporting MONTH / DAY / HOUR granularity
     * with optional date-range, activity-type and status filters.
     *
     * @param userId       mandatory, the authenticated user's id
     * @param fromDate     start of window (inclusive), may be null → -∞
     * @param toDate       end   of window (exclusive), may be null → +∞
     * @param granularity  "MONTH" | "DAY" | "HOUR"
     * @param activityType optional filter (null = all types)
     * @param status       optional filter (null = APPROVED only)
     * @return ProgressGraphDTO with sorted labels and matching point totals
     */
    public ProgressGraphDTO getProgressGraph(Long userId,
                                             LocalDateTime fromDate,
                                             LocalDateTime toDate,
                                             String granularity,
                                             String activityType,
                                             String status) {

        // Choose the period-label SQL expression
        String periodExpr;
        if ("DAY".equalsIgnoreCase(granularity)) {
            periodExpr = "TO_CHAR(created_at, 'YYYY-MM-DD')";
        } else if ("HOUR".equalsIgnoreCase(granularity)) {
            periodExpr = "TO_CHAR(created_at, 'HH24')";
        } else {
            // default: MONTH
            periodExpr = "TO_CHAR(created_at, 'YYYY-MM')";
        }

        StringBuilder sql = new StringBuilder(
                "SELECT " + periodExpr + " AS label, COALESCE(SUM(points),0) AS total_points " +
                "FROM activities WHERE user_id = ? ");

        List<Object> params = new ArrayList<>();
        params.add(userId);

        // Status filter (default to APPROVED only)
        if (status != null && !status.isBlank()) {
            sql.append("AND status = ? ");
            params.add(status.toUpperCase());
        } else {
            sql.append("AND status = 'APPROVED' ");
        }

        if (fromDate != null) {
            sql.append("AND created_at >= ? ");
            params.add(fromDate);
        }
        if (toDate != null) {
            sql.append("AND created_at < ? ");
            params.add(toDate);
        }
        if (activityType != null && !activityType.isBlank()) {
            sql.append("AND activity_type = ? ");
            params.add(activityType);
        }

        // PostgreSQL does NOT allow aliases in GROUP BY — repeat the full expression
        sql.append("GROUP BY ").append(periodExpr)
           .append(" ORDER BY ").append(periodExpr);

        // Collect ordered results
        Map<String, Integer> ordered = new LinkedHashMap<>();
        jdbcTemplate.query(sql.toString(), rs -> {
            ordered.put(rs.getString("label"), rs.getInt("total_points"));
        }, params.toArray());

        List<String> labels = new ArrayList<>(ordered.keySet());
        List<Integer> values = new ArrayList<>(ordered.values());

        // For HOUR granularity, fill in any missing hour slots (00–23)
        if ("HOUR".equalsIgnoreCase(granularity)) {
            Map<String, Integer> hourMap = new LinkedHashMap<>();
            for (int h = 0; h < 24; h++) {
                String key = String.format("%02d", h);
                hourMap.put(key, ordered.getOrDefault(key, 0));
            }
            labels = new ArrayList<>(hourMap.keySet());
            values = new ArrayList<>(hourMap.values());
        }

        int totalPoints = values.stream().mapToInt(Integer::intValue).sum();
        String effectiveGranularity = granularity != null ? granularity.toUpperCase() : "MONTH";
        return new ProgressGraphDTO(effectiveGranularity, labels, values, totalPoints);
    }

    public List<Activity> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM activities ORDER BY created_at DESC",
                new ActivityRowMapper());
    }

    public List<Activity> findByUserId(Long userId) {
        return jdbcTemplate.query(
                "SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC",
                new ActivityRowMapper(),
                userId);
    }

    public List<Activity> findByStatus(String status) {
        return jdbcTemplate.query(
                "SELECT * FROM activities WHERE status = ? ORDER BY created_at DESC",
                new ActivityRowMapper(),
                status);
    }

    public void updateStatus(Long activityId, String status) {
        jdbcTemplate.update(
                "UPDATE activities SET status = ? WHERE id = ?",
                status,
                activityId);
    }

    public void updateRejectionReason(Long activityId, String reason) {
        jdbcTemplate.update(
                "UPDATE activities SET rejection_reason = ? WHERE id = ?",
                reason,
                activityId);
    }

    public List<Activity> getActivitiesByUser(Long userId) {
        return findByUserId(userId);
    }

    public void submitProof(Long activityId, String proofImage, Double lat, Double lon,
            java.time.LocalDateTime proofTime) {
        String sql = "UPDATE activities SET proof_image = ?, latitude = ?, longitude = ?, proof_time = ?, status = 'PROOF_SUBMITTED' WHERE id = ?";
        jdbcTemplate.update(sql, proofImage, lat, lon, proofTime, activityId);
    }

    /**
     * Record the journey start GPS point and timestamp.
     * Stores the coordinates using the existing latitude/longitude columns.
     * Sets status to JOURNEY_STARTED.
     */
    public void saveJourneyStart(Long activityId, Double startLat, Double startLon, java.time.LocalDateTime startTime) {
        String sql = "UPDATE activities SET latitude = ?, longitude = ?, proof_time = ?, status = 'JOURNEY_STARTED' WHERE id = ?";
        jdbcTemplate.update(sql, startLat, startLon, startTime, activityId);
    }

    /**
     * Record the journey end — updates status based on GPS validity.
     * Extended GPS columns (end_lat, etc.) are not in the current schema;
     * only status is updated here.
     */
    public void saveJourneyEnd(Long activityId, Double endLat, Double endLon, java.time.LocalDateTime endTime,
                               Double distanceKm, Double speedKmh, boolean gpsValid) {
        String newStatus = gpsValid ? "GPS_VALID" : "FLAGGED";
        jdbcTemplate.update("UPDATE activities SET status = ? WHERE id = ?", newStatus, activityId);
    }

    /**
     * Submit ticket photo after GPS validation – sets status to PROOF_SUBMITTED.
     */
    public void submitTicketPhoto(Long activityId, String proofImage) {
        String sql = "UPDATE activities SET proof_image = ?, status = 'PROOF_SUBMITTED' WHERE id = ?";
        jdbcTemplate.update(sql, proofImage, activityId);
    }

    /**
     * Fetch all activities with user info and global rank for Admin Panel.
     */
    public List<AdminActivityDto> findAllWithUser() {
        String sql = "WITH user_ranks AS (" +
                "SELECT id, RANK() OVER (ORDER BY points DESC) AS rank FROM users" +
                ") " +
                "SELECT a.*, " +
                "u.name AS user_name, u.email AS user_email, u.username AS user_username, " +
                "ur.rank AS user_rank " +
                "FROM activities a " +
                "LEFT JOIN users u ON a.user_id = u.id " +
                "LEFT JOIN user_ranks ur ON u.id = ur.id " +
                "ORDER BY a.created_at DESC";
        return jdbcTemplate.query(sql, new AdminActivityDtoRowMapper());
    }

    /**
     * Delete a single activity by ID.
     */
    public void deleteById(Long activityId) {
        jdbcTemplate.update("DELETE FROM activities WHERE id = ?", activityId);
    }

    /**
     * Bulk-delete a list of activity IDs.
     * Returns the number of rows deleted.
     */
    public int bulkSoftDeleteByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return 0;
        // Build IN clause without streams
        StringBuilder ph = new StringBuilder();
        for (int i = 0; i < ids.size(); i++) { if (i > 0) ph.append(","); ph.append("?"); }
        String sql = "DELETE FROM activities WHERE id IN (" + ph + ")";
        return jdbcTemplate.update(sql, ids.toArray());
    }

    /**
     * Archive placeholder — is_archived column not present in current schema.
     * Returns 0 without executing any query.
     */
    public int archiveOlderThan(LocalDateTime cutoff) {
        // is_archived column does not exist in the activities table.
        // This is a safe no-op until a migration adds the column.
        return 0;
    }

    /**
     * Dynamic search across activities with optional filters.
     * Supports: text query (ID/name/email/username), category, status, date range,
     * plus optionally including archived and/or deleted records.
     * Used by the Admin Search panel.
     */
    public List<AdminActivityDto> searchActivities(String query, String category,
                                                    String status, String dateFrom,
                                                    String dateTo,
                                                    boolean includeArchived,
                                                    boolean includeDeleted) {
        StringBuilder sql = new StringBuilder(
            "WITH user_ranks AS (SELECT id, RANK() OVER (ORDER BY points DESC) AS rank FROM users) " +
            "SELECT a.*, u.name AS user_name, u.email AS user_email, u.username AS user_username, " +
            "ur.rank AS user_rank " +
            "FROM activities a " +
            "LEFT JOIN users u ON a.user_id = u.id " +
            "LEFT JOIN user_ranks ur ON u.id = ur.id " +
            "WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        // Note: is_deleted / is_archived columns do not exist in the current schema.
        // Visibility filter parameters are accepted by the API but not applied at DB level.

        if (query != null && !query.isBlank()) {
            // Strip leading '#' to support '#18' and '18' as equivalent ID searches
            String raw = query.trim();
            String stripped = raw.startsWith("#") ? raw.substring(1) : raw;
            boolean isNumericId = stripped.matches("\\d+");

            if (isNumericId) {
                // Exact numeric ID match — safe, no cast, no wildcard
                sql.append(" AND a.id = ?");
                params.add(Long.parseLong(stripped));
            } else {
                // Text search: user name, email, username, or activity type
                String like = "%" + raw.toLowerCase() + "%";
                sql.append(" AND (LOWER(COALESCE(u.name,'')) LIKE ?"
                    + " OR LOWER(COALESCE(u.email,'')) LIKE ?"
                    + " OR LOWER(COALESCE(u.username,'')) LIKE ?"
                    + " OR LOWER(COALESCE(a.activity_type,'')) LIKE ?)");
                params.add(like);
                params.add(like);
                params.add(like);
                params.add(like);
            }
        }

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            sql.append(" AND UPPER(COALESCE(a.activity_type,'')) LIKE ?");
            params.add("%" + category.toUpperCase().trim() + "%");
        }

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND a.status = ?");
            params.add(status.trim());
        }

        if (dateFrom != null && !dateFrom.isBlank()) {
            sql.append(" AND a.created_at >= ?");
            params.add(LocalDate.parse(dateFrom).atStartOfDay());
        }

        if (dateTo != null && !dateTo.isBlank()) {
            sql.append(" AND a.created_at <= ?");
            params.add(LocalDate.parse(dateTo).atTime(23, 59, 59));
        }

        sql.append(" ORDER BY a.created_at DESC");

        return jdbcTemplate.query(sql.toString(), new AdminActivityDtoRowMapper(), params.toArray());
    }
}
