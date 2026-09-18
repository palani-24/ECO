package com.ecoreward.rewards.service;

import com.ecoreward.rewards.dto.RedeemRequest;
import com.ecoreward.rewards.dto.RedeemResponse;
import com.ecoreward.rewards.model.RedemptionClaim;
import com.ecoreward.rewards.model.RewardItem;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RewardService {

    private final Map<String, RewardItem> catalog = new ConcurrentHashMap<>();
    private final List<RedemptionClaim> claimsHistory = Collections.synchronizedList(new ArrayList<>());
    private final Random random = new Random();

    public RewardService() {
        initCatalog();
        initSampleClaims();
    }

    private void initCatalog() {
        // 1. Eco & Planet Impact
        catalog.put("tree_planting", new RewardItem(
                "rw-1", "tree_planting", "Plant a Real Geo-Tagged Tree (Living Seedling)",
                "Sponsor an actual native sapling (Neem/Teak) planted in reserve zones with GPS Coordinates and official NGO certificate.",
                "eco", 500, "Verified NGO", "Tamil Nadu Green Mission", "🌳",
                "Offsets ~22kg CO2/year per tree", 1000, false, null, null
        ));

        catalog.put("ocean_plastic", new RewardItem(
                "rw-2", "ocean_plastic", "Recover 2kg Ocean-Bound Plastic",
                "Fund certified coastal recovery operations removing 2,000 grams of ocean plastic before entering marine habitats.",
                "eco", 400, "Marine Impact", "CleanSeas Alliance", "🌊",
                "Stops 2kg marine debris & microplastics", 500, false, null, null
        ));

        // 2. Green Transit & Clean Utilities
        catalog.put("metro_pass", new RewardItem(
                "rw-3", "metro_pass", "Green Metro Rail & EV Bus Pass (₹100 Recharge)",
                "Instant smart transit credit valid for CMRL Metro trains & Metropolitan Electric Smart Buses.",
                "transit", 350, "Green Commute", "CMRL / Smart Transit", "🚇",
                "Replaces 4.2kg vehicular carbon emissions", 250, true, "Smart Card / Phone No", "Enter Metro Smart Card Number"
        ));

        catalog.put("ev_charging", new RewardItem(
                "rw-4", "ev_charging", "EV Fast Charging Wallet Credits (₹150)",
                "Redeemable across Tata Power EZ Charge, Ather Grid, and Kazam public EV fast charging stations.",
                "transit", 450, "Clean Mobility", "Tata Power / Ather Grid", "⚡",
                "Powers ~35km zero-emission EV riding", 180, true, "EV App Registered Mobile", "e.g. 9876543210"
        ));

        catalog.put("solar_rebate", new RewardItem(
                "rw-5", "solar_rebate", "Rooftop Solar & Clean Energy Rebate (₹200 Off)",
                "Subsidy rebate certificate towards rooftop solar inspection, grid metering, or green power surcharge.",
                "utility", 600, "Renewable Energy", "TNERC Green Energy Portal", "☀️",
                "Supports decentralized rooftop solar generation", 100, true, "Solar / Electricity Consumer No", "e.g. 04-123-5678"
        ));

        catalog.put("tneb_discount", new RewardItem(
                "rw-6", "tneb_discount", "TNEB Electricity Bill Rebate (₹150 Off)",
                "Direct rebate coupon for Tamil Nadu Electricity domestic/residential consumer accounts.",
                "utility", 500, "Smart City", "TNEB TANGEDCO", "💡",
                "Promotes domestic conservation incentives", 300, true, "TNEB Consumer Number", "e.g. 09-245-001"
        ));

        catalog.put("water_discount", new RewardItem(
                "rw-7", "water_discount", "Metro Water & Tax Discount (₹100 Off)",
                "CMWSSB & Municipal rainwater harvesting incentive certificate.",
                "utility", 350, "Civic Benefit", "CMWSSB / Smart City", "💧",
                "Incentivizes water conservation & zero-waste", 400, true, "Water Connection ID", "CMC Water ID"
        ));

        // 3. Sustainable Shopping & Partner Vouchers
        catalog.put("ecostore_voucher", new RewardItem(
                "rw-8", "ecostore_voucher", "20% Off Zero-Waste & Organic Store",
                "Unlock a 20% discount code valid on organic foods, bamboo essentials, and compostable goods.",
                "voucher", 250, "Eco Certified", "EcoStore Partner Network", "🛍️",
                "Promotes single-use plastic alternatives", 1000, false, null, null
        ));

        catalog.put("amazon_gc", new RewardItem(
                "rw-9", "amazon_gc", "₹100 Amazon Eco-Friendly Essentials Gift Card",
                "Digital gift voucher code delivered to your registered email for verified sustainable storefronts.",
                "voucher", 800, "Instant Digital", "Amazon Pay", "📦",
                "Usable on certified climate pledge items", 150, true, "Delivery Email", "e.g. user@example.com"
        ));

        // 4. Mystery Gamified Draw
        catalog.put("mystery_box", new RewardItem(
                "rw-10", "mystery_box", "Eco Mystery Lucky Box (Instant Win)",
                "Spend 150 points for a guaranteed surprise: Win up to 500 bonus points, exclusive vouchers, or tree saplings!",
                "mystery", 150, "Gamified Win", "EcoReward Gamification", "🎁",
                "100% Guaranteed Surprise Outcome!", 9999, false, null, null
        ));
    }

    private void initSampleClaims() {
        claimsHistory.add(new RedemptionClaim(
                UUID.randomUUID().toString(), "user_sample", "ecostore_voucher",
                "20% Off Zero-Waste & Organic Store", "EcoStore", 250,
                "ECO-ZERO-2026", "completed", "voucher", "Online Store",
                LocalDateTime.now().minusDays(2), "Valid for 60 days"
        ));
        claimsHistory.add(new RedemptionClaim(
                UUID.randomUUID().toString(), "user_sample", "tree_planting",
                "Plant a Real Geo-Tagged Tree (Living Seedling)", "Tamil Nadu Green Mission", 500,
                "TREE-TN-77492", "completed", "eco", "GPS: 13.0827° N, 80.2707° E",
                LocalDateTime.now().minusDays(5), "Permanent Certificate"
        ));
        claimsHistory.add(new RedemptionClaim(
                UUID.randomUUID().toString(), "user_sample", "metro_pass",
                "Green Metro Rail Pass (₹100 Recharge)", "CMRL", 350,
                "CMRL-98214-GREEN", "completed", "transit", "Card: 9840-XXXX-21",
                LocalDateTime.now().minusDays(7), "Valid for 30 days"
        ));
    }

    public List<RewardItem> getCatalog() {
        return new ArrayList<>(catalog.values());
    }

    public List<RedemptionClaim> getUserClaims(String userId) {
        return claimsHistory.stream()
                .filter(c -> userId == null || "all".equalsIgnoreCase(userId) || c.getUserId().equals(userId) || "user_sample".equals(c.getUserId()))
                .sorted((a, b) -> b.getClaimedAt().compareTo(a.getClaimedAt()))
                .collect(Collectors.toList());
    }

    public synchronized RedeemResponse redeemReward(RedeemRequest request) {
        RewardItem item = catalog.get(request.getRewardKey());
        if (item == null) {
            return new RedeemResponse(false, "Reward not found in catalog", request.getUserCurrentPoints(), null);
        }

        if (request.getUserCurrentPoints() < item.getPointsCost()) {
            return new RedeemResponse(false, "Insufficient points. Required: " + item.getPointsCost() + " pts", request.getUserCurrentPoints(), null);
        }

        if (item.isRequiresInput() && (request.getUserInput() == null || request.getUserInput().trim().isEmpty())) {
            return new RedeemResponse(false, "Please provide " + item.getInputLabel(), request.getUserCurrentPoints(), null);
        }

        int remainingPoints = request.getUserCurrentPoints() - item.getPointsCost();

        // Generate special code based on type
        String codePrefix = item.getKey().toUpperCase().replaceAll("[^A-Z]", "");
        if (codePrefix.length() > 6) codePrefix = codePrefix.substring(0, 6);
        String uniqueSuffix = String.format("%04d", random.nextInt(10000));
        String voucherCode = codePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase() + "-" + uniqueSuffix;

        String expiry = "eco".equals(item.getCategory()) ? "Lifetime Certificate" : "Valid for 60 days";
        String status = "completed";

        // Special handling for Mystery Box
        String displayTitle = item.getTitle();
        if ("mystery_box".equals(item.getKey())) {
            int mysteryRoll = random.nextInt(4);
            switch (mysteryRoll) {
                case 0 -> {
                    displayTitle = "🎁 Won 300 Bonus EcoPoints! (Code: " + voucherCode + ")";
                    voucherCode = "BONUS-300-PTS";
                }
                case 1 -> {
                    displayTitle = "🎁 Won 40% Off Mega Eco Store Coupon!";
                    voucherCode = "ECO-SUPER-40";
                }
                case 2 -> {
                    displayTitle = "🎁 Sponsered Free Native Seedling!";
                    voucherCode = "TREE-FREE-" + uniqueSuffix;
                }
                default -> {
                    displayTitle = "🎁 Won ₹100 Clean Transit Metro Recharge!";
                    voucherCode = "METRO-WIN-100";
                }
            }
        }

        RedemptionClaim claim = new RedemptionClaim(
                UUID.randomUUID().toString(),
                request.getUserId() != null ? request.getUserId() : "user_sample",
                item.getKey(),
                displayTitle,
                item.getProvider(),
                item.getPointsCost(),
                voucherCode,
                status,
                item.getCategory(),
                request.getUserInput() != null ? request.getUserInput() : "Instant Digital Claim",
                LocalDateTime.now(),
                expiry
        );

        claimsHistory.add(0, claim);

        return new RedeemResponse(true, "Successfully redeemed " + item.getTitle() + "!", remainingPoints, claim);
    }

    public Map<String, Object> getImpactStats() {
        long treeCount = claimsHistory.stream().filter(c -> "tree_planting".equals(c.getRewardKey())).count() + 142;
        long plasticKg = claimsHistory.stream().filter(c -> "ocean_plastic".equals(c.getRewardKey())).count() * 2 + 380;
        long transitKm = claimsHistory.stream().filter(c -> "metro_pass".equals(c.getRewardKey()) || "ev_charging".equals(c.getRewardKey())).count() * 25 + 1250;

        Map<String, Object> stats = new HashMap<>();
        stats.put("treesPlanted", treeCount);
        stats.put("oceanPlasticDivertedKg", plasticKg);
        stats.put("cleanTransitKmOffset", transitKm);
        stats.put("totalVouchersIssued", claimsHistory.size() + 2450);
        return stats;
    }
}
