package com.fitforge.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitforge.model.HealthProfile;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class FallbackPlanService {

    private static final List<String> DAYS = List.of(
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
    private static final List<String> MEAL_SLOTS = List.of(
            "breakfast", "morningSnack", "lunch", "eveningSnack", "dinner");
    private static final int[] CALORIE_SHARES = {25, 10, 30, 10, 25};

    private final ObjectMapper objectMapper;

    public FallbackPlanService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String mealPlan(HealthProfile profile) {
        int target = profile.getDailyCalorieTarget() == null ? 2000 : profile.getDailyCalorieTarget();
        double proteinTarget = target * 0.30 / 4;
        double carbsTarget = target * 0.40 / 4;
        double fatsTarget = target * 0.30 / 9;
        List<String> allergies = split(profile.getAllergies());
        String diet = value(profile.getDietType(), "VEGETARIAN").toUpperCase(Locale.ROOT);
        List<Map<String, Object>> weeklyPlan = new ArrayList<>();

        for (int dayIndex = 0; dayIndex < DAYS.size(); dayIndex++) {
            Map<String, Object> meals = new LinkedHashMap<>();
            int dailyCalories = 0;
            for (int mealIndex = 0; mealIndex < MEAL_SLOTS.size(); mealIndex++) {
                MealChoice choice = chooseMeal(diet, allergies, mealIndex, dayIndex);
                int calories = target * CALORIE_SHARES[mealIndex] / 100;
                double scale = calories / (double) choice.baseCalories();
                Map<String, Object> meal = new LinkedHashMap<>();
                meal.put("name", choice.name());
                meal.put("calories", calories);
                meal.put("protein", round(choice.protein() * scale));
                meal.put("carbs", round(choice.carbs() * scale));
                meal.put("fats", round(choice.fats() * scale));
                meal.put("ingredients", choice.ingredients());
                meal.put("instructions", choice.instructions());
                meals.put(MEAL_SLOTS.get(mealIndex), meal);
                dailyCalories += calories;
            }

            Map<String, Object> day = new LinkedHashMap<>();
            day.put("day", DAYS.get(dayIndex));
            day.put("totalCalories", dailyCalories);
            day.put("protein", round(proteinTarget));
            day.put("carbs", round(carbsTarget));
            day.put("fats", round(fatsTarget));
            day.put("meals", meals);
            weeklyPlan.add(day);
        }

        return serialize(Map.of(
                "weeklyPlan", weeklyPlan,
                "tips", List.of("Drink water regularly through the day.",
                        "Include a protein source with each main meal.",
                        "Adjust portions to your hunger and activity level.")));
    }

    public String workoutPlan(HealthProfile profile) {
        String restrictions = value(profile.getMedicalConditions(), "").toLowerCase(Locale.ROOT);
        String equipment = value(profile.getAvailableEquipment(), "BODYWEIGHT");
        String level = value(profile.getFitnessLevel(), "BEGINNER").toUpperCase(Locale.ROOT);
        String goal = value(profile.getFitnessGoal(), "GENERAL_FITNESS");
        int duration = profile.getWorkoutDurationMin() == null ? 45 : profile.getWorkoutDurationMin();
        int sets = "ADVANCED".equals(level) ? 4 : "INTERMEDIATE".equals(level) ? 3 : 2;
        boolean kneeSensitive = restrictions.contains("knee");
        boolean backSensitive = restrictions.contains("back");
        boolean lowIntensity = restrictions.contains("hypertension") || restrictions.contains("asthma");
        List<Map<String, Object>> weeklyPlan = new ArrayList<>();

        for (int dayIndex = 0; dayIndex < DAYS.size(); dayIndex++) {
            boolean restDay = dayIndex == 2 || dayIndex == 6;
            List<Map<String, Object>> exercises = new ArrayList<>();
            if (!restDay) {
                List<String> names = exerciseNames(dayIndex, kneeSensitive, backSensitive, lowIntensity, equipment);
                for (String name : names) {
                    Map<String, Object> exercise = new LinkedHashMap<>();
                    exercise.put("name", name);
                    exercise.put("sets", sets);
                    exercise.put("reps", lowIntensity ? "8-12 controlled reps" : "10-15");
                    exercise.put("rest", lowIntensity ? "90 sec" : "60 sec");
                    exercise.put("targetMuscles", List.of("full body"));
                    exercise.put("difficulty", level);
                    exercise.put("instructions", "Use a comfortable range of motion and stop if you feel pain.");
                    exercise.put("modifications", "Reduce repetitions or use a supported variation if needed.");
                    exercises.add(exercise);
                }
            }

            Map<String, Object> day = new LinkedHashMap<>();
            day.put("day", DAYS.get(dayIndex));
            day.put("focus", restDay ? "Recovery" : goal.replace('_', ' ') + " - Full Body");
            day.put("isRestDay", restDay);
            day.put("totalDuration", restDay ? 0 : duration);
            day.put("warmup", restDay ? List.of() : List.of(Map.of(
                    "name", "Easy warm-up", "duration", "5 min", "description", "Move gently at a conversational pace.")));
            day.put("exercises", exercises);
            day.put("cooldown", restDay ? List.of() : List.of(Map.of(
                    "name", "Gentle cooldown", "duration", "5 min", "description", "Breathe slowly and stretch without forcing.")));
            weeklyPlan.add(day);
        }

        return serialize(Map.of(
                "weeklyPlan", weeklyPlan,
                "safetyNotes", List.of("Stop if you feel pain, dizziness, or unusual shortness of breath.",
                        "Choose movements appropriate for your equipment and physical restrictions."),
                "weeklyGoals", "Build a consistent routine with gradual, comfortable progress."));
    }

    private List<String> exerciseNames(int day, boolean kneeSensitive, boolean backSensitive,
                                       boolean lowIntensity, String equipment) {
        String equipmentLower = equipment.toLowerCase(Locale.ROOT);
        List<String> names = new ArrayList<>();
        if (kneeSensitive || lowIntensity) {
            names.add("Seated marching");
            names.add("Wall push-ups");
        } else {
            names.add(day % 2 == 0 ? "Brisk walking" : "Step-back-free low-impact cardio");
            names.add("Chair squats");
        }
        if (equipmentLower.contains("dumbbell")) {
            names.add("Seated dumbbell shoulder press");
            names.add("Supported dumbbell row");
        } else if (equipmentLower.contains("band")) {
            names.add("Resistance-band row");
            names.add("Resistance-band chest press");
        } else {
            names.add(backSensitive ? "Bird-dog" : "Glute bridge");
            names.add("Standing wall plank");
        }
        return names;
    }

    private MealChoice chooseMeal(String diet, List<String> allergies, int slot, int day) {
        List<MealChoice> choices = mealChoices(diet, slot);
        List<MealChoice> safeChoices = choices.stream()
                .filter(choice -> allergies.stream().noneMatch(allergen ->
                        (choice.name() + " " + String.join(" ", choice.ingredients()))
                                .toLowerCase(Locale.ROOT).contains(allergen)))
                .toList();
        if (!safeChoices.isEmpty()) {
            return safeChoices.get(day % safeChoices.size());
        }
        return new MealChoice("Simple allergen-aware meal", 300, 12, 45, 7,
                List.of("Choose ingredients that do not contain your listed allergens"),
                "Check ingredient labels and prepare with foods you know are safe for you.");
    }

    private List<MealChoice> mealChoices(String diet, int slot) {
        boolean vegan = diet.contains("VEGAN");
        boolean vegetarian = vegan || diet.equals("VEGETARIAN") || diet.equals("VEG");
        return switch (slot) {
            case 0 -> List.of(
                    meal("Idli with sambar", 350, 12, 62, 5, "idli", "lentils", "vegetables"),
                    meal("Vegetable poha", 350, 9, 58, 9, "flattened rice", "vegetables"),
                    meal("Besan chilla", 350, 18, 40, 11, "chickpea flour", "vegetables"));
            case 1 -> List.of(
                    meal("Banana and seasonal fruit", 150, 2, 35, 1, "banana", "seasonal fruit"),
                    meal("Roasted chana", 150, 8, 24, 3, "chickpeas"),
                    meal(vegan ? "Soy yogurt with fruit" : "Curd with fruit", 150, 8, 20, 4, vegan ? "soy" : "dairy", "fruit"));
            case 2 -> vegetarian
                    ? List.of(
                        meal("Dal, rice and vegetables", 500, 20, 78, 12, "lentils", "rice", "vegetables"),
                        meal("Chana masala with roti", 500, 20, 72, 14, "chickpeas", "wheat", "vegetables"),
                        meal(vegan ? "Tofu vegetable rice bowl" : "Paneer vegetable rice bowl", 500, 28, 58, 16,
                                vegan ? "tofu" : "dairy", "rice", "vegetables"))
                    : List.of(
                        meal("Chicken curry with rice", 500, 38, 60, 12, "chicken", "rice", "vegetables"),
                        meal("Egg curry with roti", 500, 28, 55, 18, "eggs", "wheat", "vegetables"),
                        meal("Fish curry with rice", 500, 35, 58, 14, "fish", "rice", "vegetables"));
            case 3 -> List.of(
                    meal("Apple and roasted makhana", 150, 4, 28, 3, "apple", "fox nuts"),
                    meal("Seasonal fruit bowl", 150, 2, 35, 1, "seasonal fruit"),
                    meal("Sprouted moong chaat", 150, 10, 24, 2, "mung beans", "vegetables"));
            default -> vegetarian
                    ? List.of(
                        meal("Vegetable khichdi", 450, 18, 68, 11, "rice", "lentils", "vegetables"),
                        meal("Tofu and vegetable curry with rice", 450, 24, 56, 13, "tofu", "rice", "vegetables"),
                        meal(vegan ? "Chickpea and vegetable curry" : "Paneer bhurji with roti", 450, 24, 52, 15,
                                vegan ? "chickpeas" : "dairy", "wheat", "vegetables"))
                    : List.of(
                        meal("Chicken and vegetable roti bowl", 450, 36, 48, 12, "chicken", "wheat", "vegetables"),
                        meal("Egg bhurji with roti", 450, 26, 48, 17, "eggs", "wheat", "vegetables"),
                        meal("Grilled fish with vegetables", 450, 35, 40, 13, "fish", "rice", "vegetables"));
        };
    }

    private MealChoice meal(String name, int calories, int protein, int carbs, int fats, String... ingredients) {
        return new MealChoice(name, calories, protein, carbs, fats, List.of(ingredients),
                "Prepare with a moderate amount of oil and season to taste.");
    }

    private List<String> split(String values) {
        if (values == null || values.isBlank() || values.equalsIgnoreCase("none")) {
            return List.of();
        }
        List<String> allergens = java.util.Arrays.stream(values.toLowerCase(Locale.ROOT).split(","))
                .map(String::trim)
                .map(value -> value.replace("allergic to", "").replace("allergy", "").trim())
                .filter(value -> !value.isBlank() && !value.equals("none"))
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
        List<String> normalized = new ArrayList<>(allergens);
        for (String allergen : allergens) {
            switch (allergen) {
                case "milk", "lactose" -> normalized.add("dairy");
                case "peanut" -> normalized.add("peanuts");
                case "gluten" -> normalized.add("wheat");
                case "egg" -> normalized.add("eggs");
                case "nuts", "tree nuts" -> normalized.addAll(List.of("peanuts", "almonds", "cashews"));
                default -> { }
            }
        }
        return normalized;
    }

    private String value(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private int round(double value) {
        return (int) Math.round(value);
    }

    private String serialize(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize fallback plan", e);
        }
    }

    private record MealChoice(String name, int baseCalories, int protein, int carbs, int fats,
                              List<String> ingredients, String instructions) { }
}
