package com.ecoreward.rewards.model;

import java.time.LocalDateTime;

public class RedemptionClaim {
    private String id;
    private String userId;
    private String rewardKey;
    private String title;
    private String provider;
    private int pointsRedeemed;
    private String voucherCode;
    private String status; // "completed", "pending"
    private String category;
    private String metadata;
    private LocalDateTime claimedAt;
    private String expiryDate;

    public RedemptionClaim() {}

    public RedemptionClaim(String id, String userId, String rewardKey, String title, 
                           String provider, int pointsRedeemed, String voucherCode, 
                           String status, String category, String metadata, 
                           LocalDateTime claimedAt, String expiryDate) {
        this.id = id;
        this.userId = userId;
        this.rewardKey = rewardKey;
        this.title = title;
        this.provider = provider;
        this.pointsRedeemed = pointsRedeemed;
        this.voucherCode = voucherCode;
        this.status = status;
        this.category = category;
        this.metadata = metadata;
        this.claimedAt = claimedAt;
        this.expiryDate = expiryDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRewardKey() { return rewardKey; }
    public void setRewardKey(String rewardKey) { this.rewardKey = rewardKey; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public int getPointsRedeemed() { return pointsRedeemed; }
    public void setPointsRedeemed(int pointsRedeemed) { this.pointsRedeemed = pointsRedeemed; }

    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public LocalDateTime getClaimedAt() { return claimedAt; }
    public void setClaimedAt(LocalDateTime claimedAt) { this.claimedAt = claimedAt; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
}
