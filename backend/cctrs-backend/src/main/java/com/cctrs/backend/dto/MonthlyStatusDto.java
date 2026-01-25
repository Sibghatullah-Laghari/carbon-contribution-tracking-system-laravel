package com.cctrs.backend.dto;

public class MonthlyStatusDto {

    private String month;
    private Integer totalPoints;
    private String improvementStatus;
    private Long userId;

    // ✅ Default constructor
    public MonthlyStatusDto() {
    }

    // ✅ Full constructor
    public MonthlyStatusDto(String month, Integer totalPoints, String improvementStatus, Long userId) {
        this.month = month;
        this.totalPoints = totalPoints;
        this.improvementStatus = improvementStatus;
        this.userId = userId;
    }

    // ✅ Constructor for responses
    public MonthlyStatusDto(Integer totalPoints, String improvementStatus) {
        this.totalPoints = totalPoints;
        this.improvementStatus = improvementStatus;
    }

    // ✅ Getters & Setters

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public String getImprovementStatus() {
        return improvementStatus;
    }

    public void setImprovementStatus(String improvementStatus) {
        this.improvementStatus = improvementStatus;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
