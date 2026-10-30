package com.fitforge.controller;

import com.fitforge.model.HealthProfile;
import com.fitforge.model.WaterLog;
import com.fitforge.model.WeightLog;
import com.fitforge.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @PostMapping("/profile")
    public ResponseEntity<HealthProfile> saveProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody HealthProfile profile) {
        return ResponseEntity.ok(userService.saveHealthProfile(userDetails.getUsername(), profile));
    }

    @GetMapping("/profile")
    public ResponseEntity<HealthProfile> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getHealthProfile(userDetails.getUsername()));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getDashboardSummary(userDetails.getUsername()));
    }

    @PostMapping("/track/weight")
    public ResponseEntity<WeightLog> logWeight(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        double weight = Double.parseDouble(body.get("weightKg").toString());
        String notes = body.containsKey("notes") ? body.get("notes").toString() : "";
        return ResponseEntity.ok(userService.logWeight(userDetails.getUsername(), weight, notes));
    }

    @GetMapping("/track/weight/history")
    public ResponseEntity<?> getWeightHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getWeightHistory(userDetails.getUsername()));
    }

    @PostMapping("/track/water")
    public ResponseEntity<WaterLog> updateWater(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        int glasses = Integer.parseInt(body.get("glasses").toString());
        return ResponseEntity.ok(userService.updateWater(userDetails.getUsername(), glasses));
    }

    @GetMapping("/track/water/today")
    public ResponseEntity<WaterLog> getTodayWater(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getTodayWater(userDetails.getUsername()));
    }
}
