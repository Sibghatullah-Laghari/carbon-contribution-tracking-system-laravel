package com.cctrs.backend.repository;

import com.cctrs.backend.dto.AdminActivityDto;
import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.mapper.ActivityRowMapper;
import com.cctrs.backend.repository.mapper.AdminActivityDtoRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.ArrayList;
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

    public List<Activity> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM activities",
                new ActivityRowMapper());
    }

    public List<Activity> findByUserId(Long userId) {
        return jdbcTemplate.query(
                "SELECT * FROM activities WHERE user_id = ?",
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
     * Sets status to JOURNEY_STARTED.
     */
    public void saveJourneyStart(Long activityId, Double startLat, Double startLon, java.time.LocalDateTime startTime) {
        String sql = "UPDATE activities SET start_lat = ?, start_lon = ?, start_time = ?, status = 'JOURNEY_STARTED' WHERE id = ?";
        jdbcTemplate.update(sql, startLat, startLon, startTime, activityId);
    }

    /**
     * Record the journey end GPS point + calculated distance/speed + gps_valid flag.
     * If GPS valid → status = GPS_VALID, else FLAGGED.
     */
    public void saveJourneyEnd(Long activityId, Double endLat, Double endLon, java.time.LocalDateTime endTime,
                               Double distanceKm, Double speedKmh, boolean gpsValid) {
        String newStatus = gpsValid ? "GPS_VALID" : "FLAGGED";
        String sql = "UPDATE activities SET end_lat = ?, end_lon = ?, end_time = ?, " +
                     "calculated_distance_km = ?, calculated_speed_kmh = ?, gps_valid = ?, " +
                     "status = ? WHERE id = ?";
        jdbcTemplate.update(sql, endLat, endLon, endTime, distanceKm, speedKmh, gpsValid, newStatus, activityId);
    }

    /**
     * Submit ticket photo after GPS validation – sets status to PROOF_SUBMITTED.
     */
    public void submitTicketPhoto(Long activityId, String proofImage) {
        String sql = "UPDATE activities SET proof_image = ?, status = 'PROOF_SUBMITTED' WHERE id = ?";
        jdbcTemplate.update(sql, proofImage, activityId);
    }

    /**
     * Fetch all activities with submitting user's name/email via LEFT JOIN.
     * Used by Admin Panel so the admin can identify each submitter.
     */
    public List<AdminActivityDto> findAllWithUser() {
        String sql = "SELECT a.*, " +
                "u.name AS user_name, u.email AS user_email, u.username AS user_username " +
                "FROM activities a " +
                "LEFT JOIN users u ON a.user_id = u.id " +
                "ORDER BY a.created_at DESC";
        return jdbcTemplate.query(sql, new AdminActivityDtoRowMapper());
    }

    /**
     * Permanently delete an activity by ID (admin-only operation).
     */
    public void deleteById(Long activityId) {
        jdbcTemplate.update("DELETE FROM activities WHERE id = ?", activityId);
    }
}
