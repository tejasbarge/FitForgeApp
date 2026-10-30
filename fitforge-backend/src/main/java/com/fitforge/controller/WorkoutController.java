package com.fitforge.controller;

import com.fitforge.model.WorkoutLog;
import com.fitforge.model.WorkoutPlan;
import com.fitforge.service.WorkoutService;
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
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping("/generate")
    public ResponseEntity<WorkoutPlan> generateWorkoutPlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) Map<String, String> request) {
        String split = request == null ? null : request.get("split");
        return ResponseEntity.ok(workoutService.generateWorkoutPlan(userDetails.getUsername(), split));
    }

    @GetMapping("/plan")
    public ResponseEntity<?> getCurrentPlan(@AuthenticationPrincipal UserDetails userDetails) {
        return workoutService.getCurrentWorkoutPlan(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/log")
    public ResponseEntity<WorkoutLog> logWorkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody WorkoutLog workoutLog) {
        return ResponseEntity.ok(workoutService.logWorkout(userDetails.getUsername(), workoutLog));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<WorkoutLog>> getWorkoutLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(workoutService.getWorkoutLogs(userDetails.getUsername(), date));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<WorkoutLog>> getWorkoutProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(workoutService.getWorkoutProgress(userDetails.getUsername(), from, to));
    }

    @PutMapping("/log/{id}/toggle")
    public ResponseEntity<WorkoutLog> toggleComplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(workoutService.toggleComplete(userDetails.getUsername(), id));
    }
}
