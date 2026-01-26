package com.cctrs.backend.repository;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.mapper.ActivityRowMapper;
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
        String sql = "INSERT INTO activities (user_id, activity_type, points, status, created_at) VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[] { "ID" });
            ps.setLong(1, activity.getUserId());
            ps.setString(2, activity.getActivityType());
            ps.setInt(3, activity.getPoints());
            ps.setString(4, activity.getStatus());
            ps.setObject(5, activity.getCreatedAt());
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

    public int getTotalPointsByUser(int userId) {
        String sql = "SELECT COALESCE(SUM(points),0) FROM activities " +
                "WHERE user_id=? AND status='APPROVED'";
        return jdbcTemplate.queryForObject(sql, Integer.class, userId);
    }

    public int getMonthlyPoints(int userId, int month, int year) {
        String sql = "SELECT COALESCE(SUM(points),0) FROM activities " +
                "WHERE user_id=? AND status='APPROVED' " +
                "AND MONTH(created_at)=? AND YEAR(created_at)=?";
        return jdbcTemplate.queryForObject(sql, Integer.class, userId, month, year);
    }

    public int getMonthlyActivityCount(int userId, int month, int year) {
        String sql = "SELECT COUNT(*) FROM activities " +
                "WHERE user_id=? AND status='APPROVED' " +
                "AND MONTH(created_at)=? AND YEAR(created_at)=?";
        return jdbcTemplate.queryForObject(sql, Integer.class, userId, month, year);
    }

    public List<Integer> getMonthWisePoints(int userId, int year) {
        String sql = "SELECT MONTH(created_at) as m, COALESCE(SUM(points),0) as p " +
                "FROM activities WHERE user_id=? AND status='APPROVED' " +
                "AND YEAR(created_at)=? " +
                "GROUP BY MONTH(created_at)";

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
}
