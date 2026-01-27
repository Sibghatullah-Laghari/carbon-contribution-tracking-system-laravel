package com.cctrs.backend.dto;

public class RejectionRequest {
    private String reason;

    public RejectionRequest() {
    }

    public RejectionRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
