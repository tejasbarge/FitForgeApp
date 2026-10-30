package com.fitforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitforge.model.HealthProfile;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FallbackPlanServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final FallbackPlanService fallbackPlanService = new FallbackPlanService(objectMapper);

    @Test
    void mealPlanHasSevenDaysAndHonorsDietAndAllergies() throws Exception {
        HealthProfile profile = HealthProfile.builder()
                .dailyCalorieTarget(2000)
                .dietType("VEGETARIAN")
                .allergies("milk allergy, wheat")
                .build();

        JsonNode plan = objectMapper.readTree(fallbackPlanService.mealPlan(profile));
        assertEquals(7, plan.path("weeklyPlan").size());

        for (JsonNode day : plan.path("weeklyPlan")) {
            assertEquals(2000, day.path("totalCalories").asInt());
            assertEquals(5, day.path("meals").size());
            String meals = day.path("meals").toString().toLowerCase();
            assertFalse(meals.contains("dairy"));
            assertFalse(meals.contains("wheat"));
            assertFalse(meals.contains("paneer"));
            assertFalse(meals.contains("chicken"));
        }
    }

    @Test
    void workoutPlanUsesDurationAndAvoidsKneeImpactExercises() throws Exception {
        HealthProfile profile = HealthProfile.builder()
                .fitnessLevel("BEGINNER")
                .fitnessGoal("WEIGHT_LOSS")
                .medicalConditions("KNEE_PAIN")
                .availableEquipment("Dumbbells")
                .workoutDurationMin(35)
                .build();

        JsonNode plan = objectMapper.readTree(fallbackPlanService.workoutPlan(profile));
        assertEquals(7, plan.path("weeklyPlan").size());
        assertEquals(35, plan.path("weeklyPlan").get(0).path("totalDuration").asInt());
        String exercises = plan.path("weeklyPlan").toString().toLowerCase();
        assertTrue(exercises.contains("dumbbell"));
        assertFalse(exercises.contains("chair squats"));
        assertFalse(exercises.contains("running"));
    }
}
