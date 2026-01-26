package com.cctrs.backend.dto;

public class UserReportDTO {

    private int totalPoints;
    private int monthlyPoints;
    private int monthlyActivities;
    private double carbonSavedKg;

    public UserReportDTO(int totalPoints, int monthlyPoints,
                         int monthlyActivities, double carbonSavedKg) {
        this.totalPoints = totalPoints;
        this.monthlyPoints = monthlyPoints;
        this.monthlyActivities = monthlyActivities;
        this.carbonSavedKg = carbonSavedKg;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public int getMonthlyPoints() {
        return monthlyPoints;
    }

    public int getMonthlyActivities() {
        return monthlyActivities;
    }

    public double getCarbonSavedKg() {
        return carbonSavedKg;
    }
}
