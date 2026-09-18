package com.ecoreward.rewards.dto;

public class RedeemRequest {
    private String userId;
    private String rewardKey;
    private int userCurrentPoints;
    private String userInput; // Consumer no, EV car reg, email, UPI ID
    private String notes;

    public RedeemRequest() {}

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRewardKey() { return rewardKey; }
    public void setRewardKey(String rewardKey) { this.rewardKey = rewardKey; }

    public int getUserCurrentPoints() { return userCurrentPoints; }
    public void setUserCurrentPoints(int userCurrentPoints) { this.userCurrentPoints = userCurrentPoints; }

    public String getUserInput() { return userInput; }
    public void setUserInput(String userInput) { this.userInput = userInput; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
