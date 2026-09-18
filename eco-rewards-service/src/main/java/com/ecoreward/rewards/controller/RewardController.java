package com.ecoreward.rewards.controller;

import com.ecoreward.rewards.dto.RedeemRequest;
import com.ecoreward.rewards.dto.RedeemResponse;
import com.ecoreward.rewards.model.RedemptionClaim;
import com.ecoreward.rewards.model.RewardItem;
import com.ecoreward.rewards.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("service", "Spring Boot Eco-Rewards Microservice");
        res.put("version", "1.0.0");
        res.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/catalog")
    public ResponseEntity<Map<String, Object>> getCatalog() {
        List<RewardItem> catalog = rewardService.getCatalog();
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("count", catalog.size());
        res.put("source", "Spring Boot Service");
        res.put("data", catalog);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/claims/{userId}")
    public ResponseEntity<Map<String, Object>> getUserClaims(@PathVariable String userId) {
        List<RedemptionClaim> claims = rewardService.getUserClaims(userId);
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("count", claims.size());
        res.put("source", "Spring Boot Service");
        res.put("data", claims);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/redeem")
    public ResponseEntity<RedeemResponse> redeem(@RequestBody RedeemRequest request) {
        RedeemResponse response = rewardService.redeemReward(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/impact")
    public ResponseEntity<Map<String, Object>> getImpact() {
        Map<String, Object> stats = rewardService.getImpactStats();
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("data", stats);
        return ResponseEntity.ok(res);
    }
}
