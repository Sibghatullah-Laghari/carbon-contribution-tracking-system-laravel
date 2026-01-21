package com.cctrs.backend.dto;

public class MonthlyStatusDto {

    private Integer totalPoints;
    private String status;

    public MonthlyStatusDto() {
    }

    public MonthlyStatusDto(Integer totalPoints, String status) {
        this.totalPoints = totalPoints;
        this.status = status;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public String getStatus() {
        return status;
    }
}
