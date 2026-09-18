package com.ecoreward.rewards.model;

public class RewardItem {
    private String id;
    private String key;
    private String title;
    private String description;
    private String category; // "eco", "transit", "utility", "voucher", "mystery"
    private int pointsCost;
    private String badge;
    private String provider;
    private String icon;
    private String impactDescription;
    private int stock;
    private boolean requiresInput;
    private String inputLabel;
    private String inputPlaceholder;

    public RewardItem() {}

    public RewardItem(String id, String key, String title, String description, String category, 
                      int pointsCost, String badge, String provider, String icon, 
                      String impactDescription, int stock, boolean requiresInput, 
                      String inputLabel, String inputPlaceholder) {
        this.id = id;
        this.key = key;
        this.title = title;
        this.description = description;
        this.category = category;
        this.pointsCost = pointsCost;
        this.badge = badge;
        this.provider = provider;
        this.icon = icon;
        this.impactDescription = impactDescription;
        this.stock = stock;
        this.requiresInput = requiresInput;
        this.inputLabel = inputLabel;
        this.inputPlaceholder = inputPlaceholder;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getPointsCost() { return pointsCost; }
    public void setPointsCost(int pointsCost) { this.pointsCost = pointsCost; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getImpactDescription() { return impactDescription; }
    public void setImpactDescription(String impactDescription) { this.impactDescription = impactDescription; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public boolean isRequiresInput() { return requiresInput; }
    public void setRequiresInput(boolean requiresInput) { this.requiresInput = requiresInput; }

    public String getInputLabel() { return inputLabel; }
    public void setInputLabel(String inputLabel) { this.inputLabel = inputLabel; }

    public String getInputPlaceholder() { return inputPlaceholder; }
    public void setInputPlaceholder(String inputPlaceholder) { this.inputPlaceholder = inputPlaceholder; }
}
