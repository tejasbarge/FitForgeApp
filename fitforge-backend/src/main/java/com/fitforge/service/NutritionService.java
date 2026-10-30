package com.fitforge.service;

import com.fitforge.model.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionService {

    private final GeminiService geminiService;
    private final UserService userService;
    private final MealPlanRepository mealPlanRepository;
    private final MealLogRepository mealLogRepository;
    private final HealthProfileRepository healthProfileRepository;
    private final FallbackPlanService fallbackPlanService;

    @Transactional
    public MealPlan generateMealPlan(String email) {
        User user = userService.getCurrentUser(email);
        HealthProfile profile = healthProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Please complete your health profile first"));

        // Calculate macros (40/30/30 split or adjust for goal)
        double protein = (profile.getDailyCalorieTarget() * 0.30) / 4;
        double carbs = (profile.getDailyCalorieTarget() * 0.40) / 4;
        double fats = (profile.getDailyCalorieTarget() * 0.30) / 9;

        String planJson;
        try {
            planJson = geminiService.generateMealPlan(
                    user.getName(), profile.getAge(), profile.getGender(),
                    profile.getWeightKg(), profile.getHeightCm(),
                    profile.getFitnessGoal(), profile.getActivityLevel(), profile.getDietType(),
                    profile.getDailyCalorieTarget(), protein, carbs, fats,
                    profile.getAllergies() != null ? profile.getAllergies() : "None"
            );
        } catch (RuntimeException e) {
            log.warn("Gemini meal plan unavailable; using personalized fallback: {}", e.getMessage());
            planJson = fallbackPlanService.mealPlan(profile);
        }

        MealPlan plan = MealPlan.builder()
                .user(user)
                .generatedDate(LocalDate.now())
                .planJson(planJson)
                .totalCalories(profile.getDailyCalorieTarget())
                .proteinG(protein)
                .carbsG(carbs)
                .fatsG(fats)
                .build();

        return mealPlanRepository.save(plan);
    }

    public Optional<MealPlan> getCurrentMealPlan(String email) {
        User user = userService.getCurrentUser(email);
        return mealPlanRepository.findTopByUserOrderByGeneratedDateDesc(user);
    }

    @Transactional
    public MealLog logMeal(String email, MealLog mealData) {
        User user = userService.getCurrentUser(email);
        mealData.setUser(user);
        if (mealData.getLogDate() == null) mealData.setLogDate(LocalDate.now());
        if (mealData.getCalories() == null || mealData.getCalories() < 0
                || mealData.getProteinG() != null && mealData.getProteinG() < 0
                || mealData.getCarbsG() != null && mealData.getCarbsG() < 0
                || mealData.getFatsG() != null && mealData.getFatsG() < 0) {
            throw new IllegalArgumentException("Nutrition values must be zero or greater");
        }
        return mealLogRepository.save(mealData);
    }

    public List<MealLog> getMealLogs(String email, LocalDate date) {
        User user = userService.getCurrentUser(email);
        return mealLogRepository.findByUserAndLogDate(user, date);
    }

    public List<MealLog> getMealProgress(String email, LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new IllegalArgumentException("Choose a valid nutrition progress date range.");
        }
        if (ChronoUnit.DAYS.between(from, to) > 365) {
            throw new IllegalArgumentException("Nutrition progress date range cannot exceed one year.");
        }
        User user = userService.getCurrentUser(email);
        return mealLogRepository.findByUserAndLogDateBetweenOrderByLogDateAsc(user, from, to);
    }

    public Integer getTodayCalories(String email) {
        User user = userService.getCurrentUser(email);
        Integer cal = mealLogRepository.sumCaloriesByUserAndDate(user, LocalDate.now());
        return cal != null ? cal : 0;
    }

    @Transactional
    public void deleteMealLog(String email, Long logId) {
        MealLog log = mealLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log not found"));
        User user = userService.getCurrentUser(email);
        if (!log.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        mealLogRepository.delete(log);
    }
}
