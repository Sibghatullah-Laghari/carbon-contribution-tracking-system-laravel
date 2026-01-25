package com.cctrs.backend.repository.mapper;

import com.cctrs.backend.model.Activity;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ActivityRowMapper implements RowMapper<Activity> {

    @Override
    public Activity mapRow(ResultSet rs, int rowNum) throws SQLException {

        Activity activity = new Activity();
        activity.setId(rs.getLong("id"));
        activity.setUserId(rs.getLong("user_id"));
        activity.setActivityType(rs.getString("activity_type"));
        activity.setPoints(rs.getInt("points"));
        activity.setStatus(rs.getString("status"));
        activity.setCreatedAt(rs.getTimestamp("created_at") != null ?
                rs.getTimestamp("created_at").toLocalDateTime() : null);

        return activity;
    }
}
