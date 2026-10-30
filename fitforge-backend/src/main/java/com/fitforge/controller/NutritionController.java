package com.fitforge.controller;

import com.fitforge.model.MealLog;
import com.fitforge.model.MealPlan;
import com.fitforge.service.NutritionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @PostMapping("/generate")
    public ResponseEntity<MealPlan> generateMealPlan(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(nutritionService.generateMealPlan(userDetails.getUsername()));
    }

    @GetMapping("/plan")
    public ResponseEntity<?> getCurrentPlan(@AuthenticationPrincipal UserDetails userDetails) {
        return nutritionService.getCurrentMealPlan(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/log")
    public ResponseEntity<MealLog> logMeal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody MealLog mealLog) {
        return ResponseEntity.ok(nutritionService.logMeal(userDetails.getUsername(), mealLog));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<MealLog>> getMealLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}") 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(nutritionService.getMealLogs(userDetails.getUsername(), date));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<MealLog>> getNutritionProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(nutritionService.getMealProgress(userDetails.getUsername(), from, to));
    }

    @GetMapping("/today-calories")
    public ResponseEntity<Map<String, Integer>> getTodayCalories(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("calories", nutritionService.getTodayCalories(userDetails.getUsername())));
    }

    @DeleteMapping("/log/{id}")
    public ResponseEntity<Void> deleteMealLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        nutritionService.deleteMealLog(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
