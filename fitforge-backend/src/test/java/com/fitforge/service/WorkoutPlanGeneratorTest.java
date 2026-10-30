package com.fitforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitforge.model.Exercise;
import com.fitforge.model.HealthProfile;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutPlanGeneratorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WorkoutPlanGenerator generator = new WorkoutPlanGenerator(objectMapper);
    private final List<Exercise> exercises = List.of(
            exercise("Push-up", "Chest", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "BACK_PAIN"),
            exercise("Glute bridge", "Glutes", "BEGINNER", "BODYWEIGHT", "FULL_BODY", ""),
            exercise("Bird-dog", "Core", "BEGINNER", "BODYWEIGHT", "FULL_BODY", ""),
            exercise("Dumbbell row", "Back", "INTERMEDIATE", "DUMBBELLS", "UPPER", "BACK_PAIN"),
            exercise("Wall push-up", "Chest", "BEGINNER", "BODYWEIGHT", "UPPER", ""),
            exercise("Bodyweight hinge", "Hamstrings", "BEGINNER", "BODYWEIGHT", "LOWER", ""),
            exercise("Dumbbell curl", "Biceps", "INTERMEDIATE", "DUMBBELLS", "PULL", ""),
            exercise("Band row", "Back", "BEGINNER", "RESISTANCE_BANDS", "PULL", ""),
            exercise("Prone Y-T raise", "Upper Back", "BEGINNER", "BODYWEIGHT", "PULL", ""),
            exercise("Dumbbell press", "Shoulders", "INTERMEDIATE", "DUMBBELLS", "PUSH", ""),
            exercise("Close-grip wall push-up", "Triceps", "BEGINNER", "BODYWEIGHT", "PUSH", ""),
            exercise("Chair squat", "Quadriceps", "BEGINNER", "BODYWEIGHT", "LEGS", "KNEE_PAIN"),
            exercise("Hip abduction", "Glutes", "BEGINNER", "BODYWEIGHT", "LEGS", ""));

    @Test
    void fullBodyPlanHasThreeTrainingDaysAndUsesDatabaseExerciseFields() throws Exception {
        HealthProfile profile = profile("BEGINNER", "GENERAL_FITNESS", "BODYWEIGHT", 40, "");
        JsonNode plan = objectMapper.readTree(generator.generate(profile, exercises, "FULL_BODY"));

        assertEquals("exercise_database", plan.path("source").asText());
        assertEquals(7, plan.path("weeklyPlan").size());
        assertEquals(3, trainingDays(plan));
        JsonNode exercise = plan.path("weeklyPlan").get(0).path("exercises").get(0);
        assertTrue(exercise.hasNonNull("sets"));
        assertTrue(exercise.hasNonNull("reps"));
        assertTrue(exercise.hasNonNull("rest"));
        assertTrue(exercise.hasNonNull("instructions"));
        assertTrue(exercise.hasNonNull("muscleGroup"));
    }

    @Test
    void splitGoalLevelEquipmentAndRestrictionChangeSelection() throws Exception {
        HealthProfile profile = profile("BEGINNER", "STRENGTH", "BODYWEIGHT", 32, "KNEE_PAIN");
        JsonNode upperLower = objectMapper.readTree(generator.generate(profile, exercises, "UPPER_LOWER"));
        assertEquals(4, trainingDays(upperLower));
        assertEquals("Upper Body", upperLower.path("weeklyPlan").get(0).path("focus").asText());
        String upperLowerJson = upperLower.toString();
        assertFalse(upperLowerJson.contains("Dumbbell row"));
        assertFalse(upperLowerJson.contains("Chair squat"));
        assertTrue(upperLowerJson.contains("\"reps\":\"4-6\""));
        assertTrue(upperLowerJson.contains("\"rest\":\"90 sec\""));

        JsonNode ppl = objectMapper.readTree(generator.generate(profile, exercises, "PUSH_PULL_LEGS"));
        assertEquals(6, trainingDays(ppl));
        assertEquals("Rest and recovery", ppl.path("weeklyPlan").get(6).path("focus").asText());
    }

    @Test
    void rejectsUnsupportedSplit() {
        assertThrows(IllegalArgumentException.class,
                () -> generator.generate(profile("BEGINNER", "STRENGTH", "BODYWEIGHT", 30, ""), exercises, "Bro split"));
    }

    private long trainingDays(JsonNode plan) {
        long count = 0;
        for (JsonNode day : plan.path("weeklyPlan")) {
            if (!day.path("isRestDay").asBoolean()) count++;
        }
        return count;
    }

    private HealthProfile profile(String level, String goal, String equipment, int duration, String restrictions) {
        return HealthProfile.builder()
                .fitnessLevel(level)
                .fitnessGoal(goal)
                .availableEquipment(equipment)
                .workoutDurationMin(duration)
                .medicalConditions(restrictions)
                .build();
    }

    private Exercise exercise(String name, String muscles, String level, String equipment,
                              String split, String restrictions) {
        return Exercise.builder()
                .id(1L)
                .name(name)
                .muscleGroup(muscles)
                .difficulty(level)
                .requiredEquipment(equipment)
                .splitCategory(split)
                .sets(3)
                .reps("10-12")
                .restTime("60 sec")
                .instructions("Perform with controlled form.")
                .restrictionTags(restrictions)
                .active(true)
                .build();
    }
}
