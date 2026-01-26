package com.cctrs.backend.dto;

/**
 * DTO for monthly summary report with badge information
 */
public class MonthlySummaryDTO {

    private int totalPoints;
    private int monthlyPoints;
    private int activityCount;
    private double carbonEstimate;
    private String badge;
    private int month;
    private int year;

    public MonthlySummaryDTO(int totalPoints, int monthlyPoints, int activityCount,
            double carbonEstimate, String badge, int month, int year) {
        this.totalPoints = totalPoints;
        this.monthlyPoints = monthlyPoints;
        this.activityCount = activityCount;
        this.carbonEstimate = carbonEstimate;
        this.badge = badge;
        this.month = month;
        this.year = year;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getMonthlyPoints() {
        return monthlyPoints;
    }

    public void setMonthlyPoints(int monthlyPoints) {
        this.monthlyPoints = monthlyPoints;
    }

    public int getActivityCount() {
        return activityCount;
    }

    public void setActivityCount(int activityCount) {
        this.activityCount = activityCount;
    }

    public double getCarbonEstimate() {
        return carbonEstimate;
    }

    public void setCarbonEstimate(double carbonEstimate) {
        this.carbonEstimate = carbonEstimate;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }
}
