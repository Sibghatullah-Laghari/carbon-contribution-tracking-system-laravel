package com.cctrs.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "monthly_summaries")
public class MonthlySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "summary_month")
    private String month;

    @Column(name = "total_points")
    private int totalPoints;

    @Column(name = "improvement_status")
    private String improvementStatus;

    // REQUIRED by JPA
    public MonthlySummary() {}

    // USED BY SERVICE
    public MonthlySummary(User user, String month, int totalPoints, String improvementStatus) {
        this.user = user;
        this.month = month;
        this.totalPoints = totalPoints;
        this.improvementStatus = improvementStatus;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getMonth() {
        return month;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public String getImprovementStatus() {
        return improvementStatus;
    }
}
