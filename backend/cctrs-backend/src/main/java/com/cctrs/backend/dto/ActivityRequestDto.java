package com.cctrs.backend.dto;

public class ActivityRequestDto {

    private Long userId;
    private String activityType;
    private Integer points;
    private String month;

    public ActivityRequestDto() {
    }

    public ActivityRequestDto(Long userId, String activityType, Integer points, String month) {
        this.userId = userId;
        this.activityType = activityType;
        this.points = points;
        this.month = month;
    }

    public Long getUserId() {
        return userId;
    }

    public String getActivityType() {
        return activityType;
    }

    public Integer getPoints() {
        return points;
    }

    public String getMonth() {
        return month;
    }
}