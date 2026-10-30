package com.fitforge.service;

import com.fitforge.model.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final WeightLogRepository weightLogRepository;
    private final MealLogRepository mealLogRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WaterLogRepository waterLogRepository;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional
    public HealthProfile saveHealthProfile(String email, HealthProfile profileData) {
        User user = getCurrentUser(email);
        var existingProfile = healthProfileRepository.findByUserId(user.getId());
        boolean firstProfile = existingProfile.isEmpty();
        HealthProfile profile = existingProfile.orElse(new HealthProfile());
        boolean weightChanged = !firstProfile
                && !java.util.Objects.equals(profile.getWeightKg(), profileData.getWeightKg());
        profile.setUser(user);
        profile.setAge(profileData.getAge());
        profile.setGender(profileData.getGender());
        profile.setHeightCm(profileData.getHeightCm());
        profile.setWeightKg(profileData.getWeightKg());
        profile.setTargetWeightKg(profileData.getTargetWeightKg());
        profile.setFitnessGoal(profileData.getFitnessGoal());
        profile.setActivityLevel(profileData.getActivityLevel());
        profile.setDietType(profileData.getDietType());
        profile.setFitnessLevel(profileData.getFitnessLevel());
        profile.setMedicalConditions(profileData.getMedicalConditions());
        profile.setAllergies(profileData.getAllergies());
        profile.setAvailableEquipment(profileData.getAvailableEquipment());
        profile.setWorkoutSplit(profileData.getWorkoutSplit() == null || profileData.getWorkoutSplit().isBlank()
                ? "FULL_BODY" : profileData.getWorkoutSplit().trim().toUpperCase(java.util.Locale.ROOT));
        profile.setWorkoutDurationMin(profileData.getWorkoutDurationMin() == null
                ? 45 : Math.max(10, Math.min(180, profileData.getWorkoutDurationMin())));

        // Calculate BMR (Mifflin-St Jeor)
        double bmr = calculateBMR(profileData.getWeightKg(), profileData.getHeightCm(),
                profileData.getAge(), profileData.getGender());
        double tdee = calculateTDEE(bmr, profileData.getActivityLevel());
        int calorieTarget = adjustCaloriesForGoal(tdee, profileData.getFitnessGoal());

        profile.setBmr(bmr);
        profile.setTdee(tdee);
        profile.setDailyCalorieTarget(calorieTarget);

        HealthProfile saved = healthProfileRepository.save(profile);

        // Log initial weight
        if (firstProfile || weightChanged) {
            WeightLog wLog = WeightLog.builder()
                    .user(user)
                    .logDate(LocalDate.now())
                    .weightKg(profileData.getWeightKg())
                    .bmi(calculateBMI(profileData.getWeightKg(), profileData.getHeightCm()))
                    .notes(firstProfile ? "Initial weight" : "Updated from profile")
                    .build();
            weightLogRepository.save(wLog);
        }

        return saved;
    }

    public HealthProfile getHealthProfile(String email) {
        User user = getCurrentUser(email);
        return healthProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found. Please complete onboarding."));
    }

    public Map<String, Object> getDashboardSummary(String email) {
        User user = getCurrentUser(email);
        LocalDate today = LocalDate.now();
        Map<String, Object> summary = new HashMap<>();

        // Today's calories
        Integer todayCalories = mealLogRepository.sumCaloriesByUserAndDate(user, today);
        summary.put("todayCalories", todayCalories != null ? todayCalories : 0);
        List<MealLog> todayMeals = mealLogRepository.findByUserAndLogDate(user, today);
        summary.put("todayProtein", todayMeals.stream().mapToDouble(m -> m.getProteinG() == null ? 0 : m.getProteinG()).sum());
        summary.put("todayCarbs", todayMeals.stream().mapToDouble(m -> m.getCarbsG() == null ? 0 : m.getCarbsG()).sum());
        summary.put("todayFats", todayMeals.stream().mapToDouble(m -> m.getFatsG() == null ? 0 : m.getFatsG()).sum());

        // Today's water
        waterLogRepository.findByUserAndLogDate(user, today)
                .ifPresent(w -> summary.put("waterGlasses", w.getGlassesCount()));
        if (!summary.containsKey("waterGlasses")) summary.put("waterGlasses", 0);

        // Latest weight
        weightLogRepository.findTopByUserOrderByLogDateDesc(user)
                .ifPresent(w -> {
                    summary.put("currentWeight", w.getWeightKg());
                    summary.put("currentBmi", w.getBmi());
                });

        // Today's workout completion
        long completedWorkouts = workoutLogRepository.countByUserAndLogDateBetweenAndCompletedTrue(user, today, today);
        summary.put("workoutsCompleted", completedWorkouts);
        workoutPlanRepository.findTopByUserOrderByCreatedAtDesc(user)
                .ifPresent(plan -> summary.put("workoutPlanJson", plan.getPlanJson()));

        // Profile data
        healthProfileRepository.findByUserId(user.getId()).ifPresent(p -> {
            summary.put("dailyCalorieTarget", p.getDailyCalorieTarget());
            summary.put("dailyProteinTarget", p.getDailyCalorieTarget() * 0.30 / 4);
            summary.put("dailyCarbsTarget", p.getDailyCalorieTarget() * 0.40 / 4);
            summary.put("dailyFatsTarget", p.getDailyCalorieTarget() * 0.30 / 9);
            summary.put("fitnessGoal", p.getFitnessGoal());
            summary.put("name", user.getName());
        });

        return summary;
    }

    private double calculateBMR(double weight, double height, int age, String gender) {
        if ("FEMALE".equalsIgnoreCase(gender)) {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }

    private double calculateTDEE(double bmr, String activityLevel) {
        return switch (activityLevel) {
            case "LIGHTLY_ACTIVE" -> bmr * 1.375;
            case "MODERATELY_ACTIVE" -> bmr * 1.55;
            case "VERY_ACTIVE" -> bmr * 1.725;
            case "EXTRA_ACTIVE" -> bmr * 1.9;
            default -> bmr * 1.2; // SEDENTARY
        };
    }

    private int adjustCaloriesForGoal(double tdee, String goal) {
        return switch (goal) {
            case "WEIGHT_LOSS" -> (int) (tdee - 500);
            case "MUSCLE_GAIN" -> (int) (tdee + 300);
            default -> (int) tdee;
        };
    }

    private double calculateBMI(double weight, double height) {
        double heightM = height / 100.0;
        return Math.round((weight / (heightM * heightM)) * 10.0) / 10.0;
    }

    // Weight logging
    @Transactional
    public WeightLog logWeight(String email, double weightKg, String notes) {
        User user = getCurrentUser(email);
        HealthProfile profile = healthProfileRepository.findByUserId(user.getId()).orElseThrow();
        double bmi = calculateBMI(weightKg, profile.getHeightCm());
        // Update profile current weight
        profile.setWeightKg(weightKg);
        healthProfileRepository.save(profile);

        return weightLogRepository.save(WeightLog.builder()
                .user(user)
                .logDate(LocalDate.now())
                .weightKg(weightKg)
                .bmi(bmi)
                .notes(notes)
                .build());
    }

    public List<WeightLog> getWeightHistory(String email) {
        User user = getCurrentUser(email);
        return weightLogRepository.findByUserOrderByLogDateAsc(user);
    }

    // Water logging
    @Transactional
    public WaterLog updateWater(String email, int glasses) {
        User user = getCurrentUser(email);
        LocalDate today = LocalDate.now();
        WaterLog log = waterLogRepository.findByUserAndLogDate(user, today)
                .orElse(WaterLog.builder().user(user).logDate(today).goalGlasses(8).glassesCount(0).build());
        log.setGlassesCount(glasses);
        log.setTotalMl(glasses * 250.0);
        return waterLogRepository.save(log);
    }

    public WaterLog getTodayWater(String email) {
        User user = getCurrentUser(email);
        return waterLogRepository.findByUserAndLogDate(user, LocalDate.now())
                .orElse(WaterLog.builder().user(user).logDate(LocalDate.now()).glassesCount(0).goalGlasses(8).totalMl(0.0).build());
    }
}
