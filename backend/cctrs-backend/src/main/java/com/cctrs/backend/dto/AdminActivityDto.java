package com.cctrs.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO for admin activity list — includes all activity fields plus the
 * submitting user's name, email, and username (via a LEFT JOIN on users).
 */
public class AdminActivityDto {

    private Long id;
    private Long userId;
    private String activityType;
    private String description;
    private Integer declaredQuantity;
    private String verificationFlag;
    private Integer points;
    private String status;
    private String rejectionReason;
    private String proofImage;
    private Double latitude;
    private Double longitude;
    private LocalDateTime proofTime;
    private LocalDateTime createdAt;

    // Soft-delete and archive flags
    private boolean deleted = false;
    private boolean archived = false;

    // User info (populated from JOIN)
    private String userName;
    private String userEmail;
    private String userUsername;
    // Global rank of the submitting user by total points
    private Integer userRank;

    public AdminActivityDto() {}

    // ---- Getters & Setters ----

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserUsername() { return userUsername; }
    public void setUserUsername(String userUsername) { this.userUsername = userUsername; }

    public Integer getUserRank() { return userRank; }
    public void setUserRank(Integer userRank) { this.userRank = userRank; }
}
