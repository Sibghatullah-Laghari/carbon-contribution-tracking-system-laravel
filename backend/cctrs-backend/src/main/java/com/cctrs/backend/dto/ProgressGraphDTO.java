package com.cctrs.backend.dto;

import java.util.List;

/**
 * DTO for flexible progress graph data (monthly / daily / hourly)
 */
public class ProgressGraphDTO {

    private String granularity;      // MONTH | DAY | HOUR
    private List<String> labels;     // e.g. ["Jan","Feb",...] / ["2025-01-01",...] / ["00","01",...]
    private List<Integer> values;    // corresponding point totals
    private int totalPoints;

    public ProgressGraphDTO() {}

    public ProgressGraphDTO(String granularity, List<String> labels, List<Integer> values, int totalPoints) {
        this.granularity = granularity;
        this.labels = labels;
        this.values = values;
        this.totalPoints = totalPoints;
    }

    public String getGranularity() { return granularity; }
    public void setGranularity(String granularity) { this.granularity = granularity; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }

    public List<Integer> getValues() { return values; }
    public void setValues(List<Integer> values) { this.values = values; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
}
