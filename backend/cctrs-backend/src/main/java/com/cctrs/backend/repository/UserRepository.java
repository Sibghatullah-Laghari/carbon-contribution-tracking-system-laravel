package com.cctrs.backend.repository;

import com.cctrs.backend.model.User;
import com.cctrs.backend.repository.mapper.UserRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public User save(User user) {

        String sql = "INSERT INTO users (name, email, username, role, points) VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[] { "ID" });
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getUsername());
            ps.setString(4, user.getRole());
            ps.setInt(5, user.getPoints());
            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKeyAs(Long.class);
        user.setId(generatedId);

        return user;
    }

    public List<User> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM users",
                new UserRowMapper());
    }

    public User findById(Long id) {
        List<User> users = jdbcTemplate.query(
                "SELECT * FROM users WHERE id = ?",
                new UserRowMapper(),
                id);
        return users.isEmpty() ? null : users.get(0);
    }

    public User findByEmail(String email) {
        List<User> users = jdbcTemplate.query(
                "SELECT * FROM users WHERE email = ?",
                new UserRowMapper(),
                email);
        return users.isEmpty() ? null : users.get(0);
    }

    public User findByUsername(String username) {
        List<User> users = jdbcTemplate.query(
                "SELECT * FROM users WHERE username = ?",
                new UserRowMapper(),
                username);
        return users.isEmpty() ? null : users.get(0);
    }

    public void updatePoints(Long userId, int points) {
        jdbcTemplate.update(
                "UPDATE users SET points = ? WHERE id = ?",
                points,
                userId);
    }

    /**
     * Find top users by points for leaderboard
     * 
     * @param limit Number of top users to return
     * @return List of top users ordered by points DESC
     */
    public List<User> findTopUsersByPoints(int limit) {
        return jdbcTemplate.query(
                "SELECT * FROM users ORDER BY points DESC LIMIT ?",
                new UserRowMapper(),
                limit);
    }

    public User findByVerificationToken(String token) {
        List<User> users = jdbcTemplate.query(
                "SELECT * FROM users WHERE verification_token = ?",
                new UserRowMapper(),
                token);
        return users.isEmpty() ? null : users.get(0);
    }

    public void updateVerificationToken(Long userId, String token) {
        jdbcTemplate.update("UPDATE users SET verification_token = ? WHERE id = ?", token, userId);
    }

    public void verifyEmail(Long userId) {
        jdbcTemplate.update("UPDATE users SET email_verified = TRUE, verification_token = NULL WHERE id = ?", userId);
    }
}
