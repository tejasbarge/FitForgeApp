package com.fitforge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitforge.model.Exercise;
import com.fitforge.model.HealthProfile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WorkoutPlanGenerator {

    private static final List<String> DAYS = List.of(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
    private static final Set<String> SPLITS = Set.of("FULL_BODY", "UPPER_LOWER", "PUSH_PULL_LEGS");
    private final ObjectMapper objectMapper;

    public WorkoutPlanGenerator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String generate(HealthProfile profile, List<Exercise> catalog, String requestedSplit) {
        String split = normalizeSplit(requestedSplit == null ? profile.getWorkoutSplit() : requestedSplit);
        String level = normalized(profile.getFitnessLevel(), "BEGINNER");
        String goal = normalized(profile.getFitnessGoal(), "GENERAL_FITNESS");
        String equipment = normalized(profile.getAvailableEquipment(), "BODYWEIGHT");
        String restrictions = normalized(profile.getMedicalConditions(), "");
        int duration = profile.getWorkoutDurationMin() == null ? 45 : Math.max(10, Math.min(180, profile.getWorkoutDurationMin()));
        int exerciseLimit = Math.max(3, Math.min(6, duration / 8));
        List<Map<String, Object>> days = new ArrayList<>();

        for (int dayIndex = 0; dayIndex < DAYS.size(); dayIndex++) {
            String focus = focusForDay(split, dayIndex);
            List<Map<String, Object>> plannedExercises = new ArrayList<>();
            if (focus != null) {
                List<Exercise> selected = selectExercises(catalog, focus, level, equipment, restrictions, exerciseLimit);
                if (selected.isEmpty()) {
                    throw new IllegalArgumentException("No safe exercises match your equipment and restrictions for " + focus
                            + ". Update your profile equipment or restrictions and try again.");
                }
                for (Exercise exercise : selected) {
                    plannedExercises.add(toPlannedExercise(exercise, level, goal));
                }
            }

            Map<String, Object> day = new LinkedHashMap<>();
            day.put("day", DAYS.get(dayIndex));
            day.put("focus", focus == null ? "Rest and recovery" : focusLabel(focus));
            day.put("isRestDay", focus == null);
            day.put("totalDuration", focus == null ? 0 : duration);
            day.put("warmup", focus == null ? List.of() : List.of(Map.of(
                    "name", "Warm-up", "duration", "5 min",
                    "description", "Start with comfortable, gentle movement before exercising.")));
            day.put("exercises", plannedExercises);
            day.put("cooldown", focus == null ? List.of() : List.of(Map.of(
                    "name", "Cool-down", "duration", "5 min",
                    "description", "Slow down gradually and stretch gently without forcing range of motion.")));
            days.add(day);
        }

        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("source", "exercise_database");
        plan.put("split", split);
        plan.put("goal", goal);
        plan.put("fitnessLevel", level);
        plan.put("availableEquipment", equipment);
        plan.put("workoutDurationMin", duration);
        plan.put("weeklyPlan", days);
        plan.put("safetyNotes", List.of("Use controlled form and stop if you feel pain, dizziness, or unusual shortness of breath.",
                "Choose a comfortable range of motion and consult a qualified professional about medical restrictions."));
        try {
            return objectMapper.writeValueAsString(plan);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize the generated workout plan", exception);
        }
    }

    public String normalizeSplit(String split) {
        String normalized = normalized(split, "FULL_BODY")
                .replace('-', '_')
                .replace('/', '_')
                .replace(' ', '_');
        if (normalized.equals("UPPERLOWER")) normalized = "UPPER_LOWER";
        if (normalized.equals("PPL") || normalized.equals("PUSH_PULL_LEGS")) normalized = "PUSH_PULL_LEGS";
        if (!SPLITS.contains(normalized)) {
            throw new IllegalArgumentException("Workout split must be Full Body, Upper/Lower, or Push/Pull/Legs.");
        }
        return normalized;
    }

    private List<Exercise> selectExercises(List<Exercise> catalog, String focus, String level,
                                           String equipment, String restrictions, int limit) {
        int maxDifficulty = difficultyRank(level);
        List<Exercise> candidates = catalog.stream()
                .filter(Exercise::isActive)
                .filter(exercise -> exercise.getSplitCategory().equalsIgnoreCase(focus))
                .filter(exercise -> difficultyRank(exercise.getDifficulty()) <= maxDifficulty)
                .filter(exercise -> hasEquipment(equipment, exercise.getRequiredEquipment()))
                .filter(exercise -> isSafe(restrictions, exercise.getRestrictionTags()))
                .toList();
        List<Exercise> balanced = new ArrayList<>();
        Set<String> selectedMuscles = new java.util.HashSet<>();
        for (Exercise candidate : candidates) {
            String primaryMuscle = candidate.getMuscleGroup().split(",")[0].trim().toUpperCase(Locale.ROOT);
            if (selectedMuscles.add(primaryMuscle)) {
                balanced.add(candidate);
                if (balanced.size() == limit) return balanced;
            }
        }
        for (Exercise candidate : candidates) {
            if (!balanced.contains(candidate)) {
                balanced.add(candidate);
                if (balanced.size() == limit) break;
            }
        }
        return balanced;
    }

    private Map<String, Object> toPlannedExercise(Exercise exercise, String level, String goal) {
        int levelRank = difficultyRank(level);
        int sets = exercise.getSets() == null ? 3 : exercise.getSets();
        String reps = exercise.getReps() == null ? "10-12" : exercise.getReps();
        String rest = exercise.getRestTime() == null ? "60 sec" : exercise.getRestTime();

        switch (goal) {
            case "STRENGTH" -> {
                sets = levelRank == 1 ? 3 : levelRank == 2 ? 4 : 5;
                reps = "4-6";
                rest = levelRank == 1 ? "90 sec" : "120-180 sec";
            }
            case "MUSCLE_GAIN" -> {
                sets = levelRank == 1 ? 3 : levelRank == 2 ? 4 : 5;
                reps = "8-12";
                rest = levelRank == 1 ? "60-90 sec" : "90 sec";
            }
            case "WEIGHT_LOSS" -> {
                sets = levelRank == 1 ? 2 : 3;
                reps = "12-15";
                rest = "45-60 sec";
            }
            default -> {
                sets = levelRank == 1 ? Math.max(2, sets - 1) : levelRank == 3 ? sets + 1 : sets;
                reps = "10-12";
                rest = "60-90 sec";
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", exercise.getId());
        result.put("name", exercise.getName());
        result.put("muscleGroup", exercise.getMuscleGroup());
        result.put("difficulty", exercise.getDifficulty());
        result.put("equipment", exercise.getRequiredEquipment());
        result.put("sets", sets);
        result.put("reps", reps);
        result.put("rest", rest);
        result.put("instructions", exercise.getInstructions());
        return result;
    }

    private boolean hasEquipment(String available, String required) {
        if (required == null || required.equalsIgnoreCase("BODYWEIGHT")) return true;
        String normalizedAvailable = available.replace("DUMBBELLS", "DUMBBELL")
                .replace("RESISTANCE BANDS", "RESISTANCE_BAND")
                .replace("BANDS", "BAND")
                .replace("MACHINES", "MACHINE");
        String normalizedRequired = required.toUpperCase(Locale.ROOT)
                .replace("DUMBBELLS", "DUMBBELL")
                .replace("RESISTANCE BANDS", "RESISTANCE_BAND")
                .replace("BANDS", "BAND")
                .replace("MACHINES", "MACHINE");
        if (normalizedAvailable.contains("GYM")) normalizedAvailable += " DUMBBELL BARBELL MACHINE CABLE";
        String availableForMatch = normalizedAvailable;
        return Arrays.stream(normalizedRequired.split(","))
                .map(String::trim)
                .anyMatch(item -> availableForMatch.contains(item.toUpperCase(Locale.ROOT)));
    }

    private boolean isSafe(String restrictions, String restrictionTags) {
        if (restrictionTags == null || restrictionTags.isBlank()) return true;
        Set<String> userRestrictions = Set.of();
        Set<String> tags = Arrays.stream(restrictionTags.split(","))
                .map(String::trim)
                .map(tag -> tag.toUpperCase(Locale.ROOT))
                .collect(Collectors.toSet());
        if (restrictions.contains("BACK") || restrictions.contains("SPINE")) userRestrictions = union(userRestrictions, "BACK_PAIN");
        if (restrictions.contains("KNEE")) userRestrictions = union(userRestrictions, "KNEE_PAIN");
        if (restrictions.contains("SHOULDER")) userRestrictions = union(userRestrictions, "SHOULDER_PAIN");
        if (restrictions.contains("WRIST")) userRestrictions = union(userRestrictions, "WRIST_PAIN");
        return userRestrictions.stream().noneMatch(tags::contains);
    }

    private Set<String> union(Set<String> current, String value) {
        java.util.HashSet<String> values = new java.util.HashSet<>(current);
        values.add(value);
        return values;
    }

    private int difficultyRank(String value) {
        return switch (normalized(value, "BEGINNER")) {
            case "ADVANCED" -> 3;
            case "INTERMEDIATE" -> 2;
            default -> 1;
        };
    }

    private String normalized(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT);
    }

    private String focusForDay(String split, int day) {
        return switch (split) {
            case "UPPER_LOWER" -> switch (day) {
                case 0, 3 -> "UPPER";
                case 1, 4 -> "LOWER";
                default -> null;
            };
            case "PUSH_PULL_LEGS" -> switch (day) {
                case 0, 3 -> "PUSH";
                case 1, 4 -> "PULL";
                case 2, 5 -> "LEGS";
                default -> null;
            };
            default -> switch (day) {
                case 0, 2, 4 -> "FULL_BODY";
                default -> null;
            };
        };
    }

    private String focusLabel(String focus) {
        return switch (focus) {
            case "FULL_BODY" -> "Full Body";
            case "UPPER" -> "Upper Body";
            case "LOWER" -> "Lower Body";
            case "PUSH" -> "Push";
            case "PULL" -> "Pull";
            case "LEGS" -> "Legs";
            default -> focus;
        };
    }
}
