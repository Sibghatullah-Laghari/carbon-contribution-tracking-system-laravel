package com.cctrs.backend.dto;

import java.util.List;

/**
 * DTO for monthly graph data
 */
public class MonthlyGraphDTO {

    private int year;
    private List<Integer> monthlyData;

    public MonthlyGraphDTO(int year, List<Integer> monthlyData) {
        this.year = year;
        this.monthlyData = monthlyData;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public List<Integer> getMonthlyData() {
        return monthlyData;
    }

    public void setMonthlyData(List<Integer> monthlyData) {
        this.monthlyData = monthlyData;
    }
}
