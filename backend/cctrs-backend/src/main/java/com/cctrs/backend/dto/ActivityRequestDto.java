package com.cctrs.backend.dto;

public class ActivityRequestDto {

    @jakarta.validation.constraints.NotNull(message = "User ID is required")
    private Long userId;

    @jakarta.validation.constraints.NotBlank(message = "Activity type is required")
    private String activityType;

    @jakarta.validation.constraints.NotNull(message = "Points are required")
    @jakarta.validation.constraints.Min(value = 0, message = "Points must be non-negative")
    private Integer points;

    // ✅ Default constructor (VERY IMPORTANT for JSON deserialization)
    public ActivityRequestDto() {
    }

    // ✅ Constructor
    public ActivityRequestDto(Long userId, String activityType, Integer points) {
        this.userId = userId;
        this.activityType = activityType;
        this.points = points;
    }

    // ✅ Getters & Setters

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
}
