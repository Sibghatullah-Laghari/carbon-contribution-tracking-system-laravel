package com.cctrs.backend.repository.mapper;

import com.cctrs.backend.model.Activity;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ActivityRowMapper implements RowMapper<Activity> {

    @Override
    public Activity mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {

        Activity activity = new Activity();
        activity.setId(rs.getLong("id"));
        activity.setUserId(rs.getLong("user_id"));
        activity.setActivityType(rs.getString("activity_type"));
        activity.setDescription(rs.getString("description"));
        activity.setDeclaredQuantity(rs.getInt("declared_quantity"));
        activity.setVerificationFlag(rs.getString("verification_flag"));
        activity.setPoints(rs.getInt("points"));
        activity.setStatus(rs.getString("status"));
        activity.setRejectionReason(rs.getString("rejection_reason"));
        activity.setProofImage(rs.getString("proof_image"));
        activity.setLatitude(rs.getObject("latitude") != null ? rs.getDouble("latitude") : null);
        activity.setLongitude(rs.getObject("longitude") != null ? rs.getDouble("longitude") : null);
        activity.setProofTime(
                rs.getTimestamp("proof_time") != null ? rs.getTimestamp("proof_time").toLocalDateTime() : null);
        activity.setCreatedAt(
                rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toLocalDateTime() : null);

        return activity;
    }
}
