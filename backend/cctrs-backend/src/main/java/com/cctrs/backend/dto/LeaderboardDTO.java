package com.cctrs.backend.dto;

/**
 * DTO for leaderboard entries
 */
public class LeaderboardDTO {

    private int rank;
    private Long userId;
    private String name;
    private int totalPoints;
    private String badge;

    public LeaderboardDTO(int rank, Long userId, String name, int totalPoints, String badge) {
        this.rank = rank;
        this.userId = userId;
        this.name = name;
        this.totalPoints = totalPoints;
        this.badge = badge;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }
}
