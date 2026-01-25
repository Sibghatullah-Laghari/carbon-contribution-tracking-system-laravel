package com.cctrs.backend.model;

import java.time.LocalDateTime;

public class Activity {

    private Long id;
    private Long userId;
    private String activityType;
    private Integer points;
    private String status; // PENDING / APPROVED
    private LocalDateTime createdAt;

    // Empty constructor
    public Activity() {
    }

    // Parameterized constructor
    public Activity(Long userId, String activityType, Integer points, String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.activityType = activityType;
        this.points = points;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
