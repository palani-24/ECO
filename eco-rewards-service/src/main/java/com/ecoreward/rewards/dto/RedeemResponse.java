package com.ecoreward.rewards.dto;

import com.ecoreward.rewards.model.RedemptionClaim;

public class RedeemResponse {
    private boolean success;
    private String message;
    private int remainingPoints;
    private RedemptionClaim claim;

    public RedeemResponse() {}

    public RedeemResponse(boolean success, String message, int remainingPoints, RedemptionClaim claim) {
        this.success = success;
        this.message = message;
        this.remainingPoints = remainingPoints;
        this.claim = claim;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getRemainingPoints() { return remainingPoints; }
    public void setRemainingPoints(int remainingPoints) { this.remainingPoints = remainingPoints; }

    public RedemptionClaim getClaim() { return claim; }
    public void setClaim(RedemptionClaim claim) { this.claim = claim; }
}
