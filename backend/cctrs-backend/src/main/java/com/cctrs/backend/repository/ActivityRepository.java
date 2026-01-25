package com.cctrs.backend.repository;

import com.cctrs.backend.model.Activity;
import com.cctrs.backend.repository.mapper.ActivityRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

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
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"ID"});
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
                activityId
        );
        return activities.isEmpty() ? null : activities.get(0);
    }

    public List<Activity> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM activities",
                new ActivityRowMapper()
        );
    }

    public List<Activity> findByUserId(Long userId) {
        return jdbcTemplate.query(
                "SELECT * FROM activities WHERE user_id = ?",
                new ActivityRowMapper(),
                userId
        );
    }

    public List<Activity> findByStatus(String status) {
        return jdbcTemplate.query(
                "SELECT * FROM activities WHERE status = ? ORDER BY created_at DESC",
                new ActivityRowMapper(),
                status
        );
    }

    public void updateStatus(Long activityId, String status) {
        jdbcTemplate.update(
                "UPDATE activities SET status = ? WHERE id = ?",
                status,
                activityId
        );
    }

    public List<Activity> getActivitiesByUser(Long userId) {
        return findByUserId(userId);
    }
}
