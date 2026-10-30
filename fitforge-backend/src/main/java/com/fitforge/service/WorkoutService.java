package com.fitforge.service;

import com.fitforge.model.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final UserService userService;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutPlanGenerator workoutPlanGenerator;

    @Transactional
    public WorkoutPlan generateWorkoutPlan(String email, String requestedSplit) {
        User user = userService.getCurrentUser(email);
        HealthProfile profile = healthProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Please complete your health profile first"));
        String split = workoutPlanGenerator.normalizeSplit(
                requestedSplit == null ? profile.getWorkoutSplit() : requestedSplit);
        profile.setWorkoutSplit(split);
        healthProfileRepository.save(profile);
        String planJson = workoutPlanGenerator.generate(profile,
                exerciseRepository.findByActiveTrueOrderBySplitCategoryAscNameAsc(), split);

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .generatedDate(LocalDate.now())
                .planJson(planJson)
                .focusAreas(split.replace('_', ' '))
                .difficulty(profile.getFitnessLevel())
                .estimatedDurationMin(profile.getWorkoutDurationMin() != null ? profile.getWorkoutDurationMin() : 45)
                .build();

        return workoutPlanRepository.save(plan);
    }

    public Optional<WorkoutPlan> getCurrentWorkoutPlan(String email) {
        User user = userService.getCurrentUser(email);
        return workoutPlanRepository.findTopByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public WorkoutLog logWorkout(String email, WorkoutLog logData) {
        User user = userService.getCurrentUser(email);
        if (logData.getDurationMin() != null && logData.getDurationMin() < 0
                || logData.getSets() != null && logData.getSets() < 0
                || logData.getReps() != null && logData.getReps() < 0
                || logData.getWeightKg() != null && logData.getWeightKg() < 0) {
            throw new IllegalArgumentException("Workout values must be zero or greater");
        }
        logData.setUser(user);
        if (logData.getLogDate() == null) logData.setLogDate(LocalDate.now());
        return workoutLogRepository.save(logData);
    }

    public List<WorkoutLog> getWorkoutLogs(String email, LocalDate date) {
        User user = userService.getCurrentUser(email);
        return workoutLogRepository.findByUserAndLogDate(user, date);
    }

    public List<WorkoutLog> getWorkoutProgress(String email, LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new IllegalArgumentException("Choose a valid workout progress date range.");
        }
        if (ChronoUnit.DAYS.between(from, to) > 365) {
            throw new IllegalArgumentException("Workout progress date range cannot exceed one year.");
        }
        User user = userService.getCurrentUser(email);
        return workoutLogRepository.findByUserAndLogDateBetweenOrderByLogDateAscCreatedAtAsc(user, from, to);
    }

    @Transactional
    public WorkoutLog toggleComplete(String email, Long logId) {
        WorkoutLog log = workoutLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        User user = userService.getCurrentUser(email);
        if (!log.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot update another user's workout");
        }
        log.setCompleted(!Boolean.TRUE.equals(log.getCompleted()));
        return workoutLogRepository.save(log);
    }
}
