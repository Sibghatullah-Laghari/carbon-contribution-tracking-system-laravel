package com.cctrs.backend.repository;

import com.cctrs.backend.model.Question;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class QuestionRepository {

    private final JdbcTemplate jdbc;

    public QuestionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Question> mapper = (rs, row) -> {
        Question q = new Question();
        q.setId(rs.getLong("id"));
        q.setName(rs.getString("name"));
        q.setEmail(rs.getString("email"));
        q.setQuestion(rs.getString("question"));
        q.setAnswer(rs.getString("answer"));
        q.setStatus(rs.getString("status"));
        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) q.setCreatedAt(created.toLocalDateTime());
        Timestamp answered = rs.getTimestamp("answered_at");
        if (answered != null) q.setAnsweredAt(answered.toLocalDateTime());
        return q;
    };

    public Question save(Question question) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO questions (name, email, question, status) VALUES (?, ?, ?, 'UNANSWERED')",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, question.getName());
            ps.setString(2, question.getEmail());
            ps.setString(3, question.getQuestion());
            return ps;
        }, keyHolder);
        question.setId(keyHolder.getKey().longValue());
        return question;
    }

    public List<Question> findAll() {
        return jdbc.query("SELECT * FROM questions ORDER BY created_at DESC", mapper);
    }

    public List<Question> findByEmail(String email) {
        return jdbc.query("SELECT * FROM questions WHERE email = ? ORDER BY created_at DESC", mapper, email);
    }

    public Question findById(Long id) {
        List<Question> list = jdbc.query("SELECT * FROM questions WHERE id = ?", mapper, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public void answerQuestion(Long id, String answer) {
        jdbc.update(
                "UPDATE questions SET answer = ?, status = 'ANSWERED', answered_at = NOW() WHERE id = ?",
                answer, id
        );
    }

    public int countUnanswered() {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM questions WHERE status = 'UNANSWERED'", Integer.class);
        return count != null ? count : 0;
    }
}

