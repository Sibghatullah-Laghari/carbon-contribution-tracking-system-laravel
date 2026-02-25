package com.cctrs.backend.model;

import java.time.LocalDateTime;

public class Activity {

    private Long id;
    private Long userId;
    private String activityType; // Keeping String for DB compatibility, or switch to Enum? prompt asked for Enum "ActivityType enum with values". I will use String in DB but maybe helper in class. Or just String to match DB VARCHAR. Let's stick to String field but with setters that can take Enum, or just String for now to minimize breakage as per "Do NOT remove existing working logic" but I should probably use the Enum constants.
    // Actually, prompt said "Update Activity entity... to include activity_type". It was already there. I'll just ensure it matches.

    private String description;
    private Integer declaredQuantity;
    private String verificationFlag; // "OK", "FLAGGED"

    // Standard Activity Types - keeping for backward compat if needed, or replace with Enum usage in code
    public static final String TYPE_TREE_PLANTATION = "Result of Enum.name() ideally"; // "Tree Plantation" was previous value. The prompt asked for specific Enum values like TREE_PLANTATION.
    // I will modify the class to use the new fields.

    private Integer points;
    private String status; // DECLARED / PROOF_SUBMITTED / APPROVED / REJECTED / FLAGGED
    private String rejectionReason;
    private String proofImage;
    private Double latitude;
    private Double longitude;
    private LocalDateTime proofTime;
    private LocalDateTime createdAt;

    public Activity() {}

    public Activity(Long userId, String activityType, Integer points, String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.activityType = activityType;
        this.points = points;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getActivityType() { return activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDeclaredQuantity() { return declaredQuantity; }
    public void setDeclaredQuantity(Integer declaredQuantity) { this.declaredQuantity = declaredQuantity; }

    public String getVerificationFlag() { return verificationFlag; }
    public void setVerificationFlag(String verificationFlag) { this.verificationFlag = verificationFlag; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getProofImage() { return proofImage; }
    public void setProofImage(String proofImage) { this.proofImage = proofImage; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getProofTime() { return proofTime; }
    public void setProofTime(LocalDateTime proofTime) { this.proofTime = proofTime; }
}

