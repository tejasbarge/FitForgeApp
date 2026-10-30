package com.fitforge.controller;

import com.fitforge.model.SleepLog;
import com.fitforge.service.SleepService;
import com.fitforge.service.GeminiService;
import com.fitforge.service.UserService;
import com.fitforge.repository.HealthProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExtrasController {

    private final SleepService sleepService;
    private final GeminiService geminiService;
    private final UserService userService;
    private final HealthProfileRepository healthProfileRepository;

    // Sleep endpoints
    @PostMapping("/track/sleep")
    public ResponseEntity<SleepLog> logSleep(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SleepLog sleepLog) {
        return ResponseEntity.ok(sleepService.logSleep(userDetails.getUsername(), sleepLog));
    }

    @GetMapping("/track/sleep/history")
    public ResponseEntity<List<SleepLog>> getSleepHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sleepService.getSleepHistory(userDetails.getUsername()));
    }

    // Recipe generation endpoint
    @PostMapping("/recipe/generate")
    public ResponseEntity<Map<String, Object>> generateRecipes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        String ingredients = body.get("ingredients");
        String dietType = body.getOrDefault("dietType", "VEGETARIAN");
        int targetCalories = body.containsKey("targetCalories")
                ? Integer.parseInt(body.get("targetCalories")) : 400;

        String recipesJson = geminiService.generateRecipes(ingredients, dietType, targetCalories);
        return ResponseEntity.ok(Map.of("result", recipesJson));
    }
}
