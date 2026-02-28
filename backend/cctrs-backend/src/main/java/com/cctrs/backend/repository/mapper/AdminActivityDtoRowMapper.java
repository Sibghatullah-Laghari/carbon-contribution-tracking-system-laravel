package com.cctrs.backend.repository.mapper;

import com.cctrs.backend.dto.AdminActivityDto;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * RowMapper for AdminActivityDto — maps the JOIN result of activities + users.
 */
public class AdminActivityDtoRowMapper implements RowMapper<AdminActivityDto> {

    @Override
    public AdminActivityDto mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        AdminActivityDto dto = new AdminActivityDto();
        dto.setId(rs.getLong("id"));
        dto.setUserId(rs.getLong("user_id"));
        dto.setActivityType(rs.getString("activity_type"));
        dto.setDescription(rs.getString("description"));
        dto.setDeclaredQuantity(rs.getInt("declared_quantity"));
        dto.setVerificationFlag(rs.getString("verification_flag"));
        dto.setPoints(rs.getInt("points"));
        dto.setStatus(rs.getString("status"));
        dto.setRejectionReason(rs.getString("rejection_reason"));
        dto.setProofImage(rs.getString("proof_image"));
        dto.setLatitude(rs.getObject("latitude") != null ? rs.getDouble("latitude") : null);
        dto.setLongitude(rs.getObject("longitude") != null ? rs.getDouble("longitude") : null);
        dto.setProofTime(rs.getTimestamp("proof_time") != null
                ? rs.getTimestamp("proof_time").toLocalDateTime() : null);
        dto.setCreatedAt(rs.getTimestamp("created_at") != null
                ? rs.getTimestamp("created_at").toLocalDateTime() : null);

        // Soft-delete / archive flags — safe fallback if migration not yet applied
        try { dto.setDeleted(rs.getBoolean("is_deleted")); } catch (SQLException ignored) {}
        try { dto.setArchived(rs.getBoolean("is_archived")); } catch (SQLException ignored) {}

        // User fields from JOIN
        dto.setUserName(rs.getString("user_name"));
        dto.setUserEmail(rs.getString("user_email"));
        dto.setUserUsername(rs.getString("user_username"));

        // Global rank — safe fallback if column not present
        try {
            int rank = rs.getInt("user_rank");
            if (!rs.wasNull()) dto.setUserRank(rank);
        } catch (SQLException ignored) {}

        return dto;
    }
}
