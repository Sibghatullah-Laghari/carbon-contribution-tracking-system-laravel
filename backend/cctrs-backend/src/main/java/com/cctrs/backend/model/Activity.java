package com.cctrs.backend.model;

import java.time.LocalDateTime;

public class Activity {

    private Long id;
    private Long userId;
    private String activityType;

    // Standard Activity Types
    public static final String TYPE_TREE_PLANTATION = "Tree Plantation";
    public static final String TYPE_RECYCLING = "Recycling";
    public static final String TYPE_PUBLIC_TRANSPORT = "Public Transport Use";
    public static final String TYPE_CLEANUP_DRIVE = "Clean-up Drive";
    public static final String TYPE_COMPOSTING = "Composting";
    public static final String TYPE_ENERGY_SAVING = "Energy Saving";
    public static final String TYPE_WATER_SAVING = "Water Saving";
    public static final String TYPE_AWARENESS = "Awareness Activity";

    private Integer points;
    private String status; // PENDING / APPROVED / REJECTED
    private String rejectionReason; // Reason for rejection (optional)
    private String proofImage; // URL/path to proof image
    private Double latitude; // GPS latitude
    private Double longitude; // GPS longitude
    private LocalDateTime proofTime; // Timestamp when proof was captured
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

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getProofImage() {
        return proofImage;
    }

    public void setProofImage(String proofImage) {
        this.proofImage = proofImage;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getProofTime() {
        return proofTime;
    }

    public void setProofTime(LocalDateTime proofTime) {
        this.proofTime = proofTime;
    }
}
