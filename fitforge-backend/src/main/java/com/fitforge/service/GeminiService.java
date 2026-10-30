package com.fitforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.api-url}")
    private String apiUrl;

    @Value("${app.gemini.model}")
    private String model;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateContent(String prompt) {
        return generateContent(prompt, 8192, 90);
    }

    private String generateContent(String prompt, int maxOutputTokens, int timeoutSeconds) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Gemini is not configured. Set GEMINI_API_KEY in the backend terminal and restart Spring Boot.");
        }
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("input", prompt);
            requestBody.put("store", false);

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.4);
            generationConfig.put("max_output_tokens", maxOutputTokens);
            generationConfig.put("thinking_level", "low");
            requestBody.put("generation_config", generationConfig);

            log.info("Sending request to Gemini model {}", model);
            String response = webClient.post()
                    .uri(apiUrl)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            JsonNode root = objectMapper.readTree(response);
            StringBuilder output = new StringBuilder();
            JsonNode steps = root.path("steps");
            if (steps.isArray()) {
                for (JsonNode step : steps) {
                    if (!"model_output".equals(step.path("type").asText())) continue;
                    JsonNode contents = step.path("content");
                    if (!contents.isArray()) continue;
                    for (JsonNode item : contents) {
                        if ("text".equals(item.path("type").asText())) {
                            output.append(item.path("text").asText());
                        }
                    }
                }
            }
            if (output.isEmpty()) {
                throw new IllegalStateException("Gemini returned an empty response.");
            }
            log.info("Gemini response received successfully");
            return output.toString();
        } catch (WebClientResponseException exception) {
            log.warn("Gemini API request failed with HTTP status {}", exception.getStatusCode().value());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gemini request failed with HTTP " + exception.getStatusCode().value()
                            + ". Check the configured API key, model access, and quota.", exception);
        } catch (IllegalStateException exception) {
            if (hasTimeoutCause(exception)) {
                throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT,
                        "Gemini took too long to respond. Please try again.", exception);
            }
            throw exception;
        } catch (Exception e) {
            if (hasTimeoutCause(e)) {
                throw new ResponseStatusException(HttpStatus.GATEWAY_TIMEOUT,
                        "Gemini took too long to respond. Please try again.", e);
            }
            log.error("Gemini API request failed ({})", e.getClass().getSimpleName());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Gemini request could not be completed. Check network access and the configured model.", e);
        }
    }

    public String generateMealPlan(String name, int age, String gender, double weightKg, double heightCm,
                                    String goal, String activityLevel, String dietType,
                                    int dailyCalories, double proteinG, double carbsG, double fatsG,
                                    String allergies) {
        String prompt = String.format("""
            You are a professional nutritionist. Generate a detailed 7-day meal plan in valid JSON format for:
            - Name: %s, Age: %d, Gender: %s
            - Weight: %.1f kg, Height: %.1f cm
            - Goal: %s, Activity Level: %s
            - Diet Type: %s
            - Daily Calorie Target: %d kcal
            - Macros: Protein %.0fg, Carbs %.0fg, Fats %.0fg
            - Allergies/Restrictions: %s
            
            Return ONLY valid JSON in this exact structure:
            {
              "weeklyPlan": [
                {
                  "day": "Monday",
                  "totalCalories": 2000,
                  "protein": 150,
                  "carbs": 200,
                  "fats": 60,
                  "meals": {
                    "breakfast": {"name": "...", "calories": 400, "protein": 30, "carbs": 50, "fats": 10, "ingredients": ["..."], "instructions": "..."},
                    "morningSnack": {"name": "...", "calories": 150, "protein": 10, "carbs": 20, "fats": 5, "ingredients": ["..."], "instructions": "..."},
                    "lunch": {"name": "...", "calories": 600, "protein": 45, "carbs": 70, "fats": 20, "ingredients": ["..."], "instructions": "..."},
                    "eveningSnack": {"name": "...", "calories": 200, "protein": 15, "carbs": 25, "fats": 8, "ingredients": ["..."], "instructions": "..."},
                    "dinner": {"name": "...", "calories": 650, "protein": 50, "carbs": 35, "fats": 17, "ingredients": ["..."], "instructions": "..."}
                  }
                }
              ],
              "tips": ["hydration tip", "meal timing tip", "prep tip"]
            }
            Include Indian food options if diet is vegetarian. Make meals realistic, nutritious and varied.
            """,
                name, age, gender, weightKg, heightCm, goal, activityLevel, dietType,
                dailyCalories, proteinG, carbsG, fatsG, allergies);

        String rawResponse = generateContent(prompt);
        // Extract JSON from the response (in case it has markdown backticks)
        return extractJson(rawResponse);
    }

    public String generateWorkoutPlan(String name, int age, String gender, String fitnessLevel,
                                       String goal, String medicalConditions, String equipment, int durationMin) {
        String prompt = String.format("""
            You are a certified fitness trainer and physical therapist. Generate a detailed 7-day workout plan in valid JSON format for:
            - Name: %s, Age: %d, Gender: %s
            - Fitness Level: %s
            - Goal: %s
            - Medical Conditions/Restrictions: %s
            - Available Equipment: %s
            - Session Duration: %d minutes per day
            
            CRITICAL SAFETY RULES:
            - If KNEE_PAIN is listed: EXCLUDE squats, lunges, running, jumping. Use chair exercises, swimming, cycling.
            - If BACK_PAIN is listed: EXCLUDE deadlifts, heavy rows, situps. Use planks, bird-dogs, gentle stretches.
            - If HYPERTENSION is listed: EXCLUDE heavy lifting, HIIT, inverted poses. Use moderate cardio, yoga.
            - If ASTHMA is listed: EXCLUDE high-intensity cardio. Use low-intensity, swimming.
            
            Return ONLY valid JSON:
            {
              "weeklyPlan": [
                {
                  "day": "Monday",
                  "focus": "Upper Body",
                  "isRestDay": false,
                  "totalDuration": 45,
                  "warmup": [{"name": "...", "duration": "5 min", "description": "..."}],
                  "exercises": [
                    {
                      "name": "...",
                      "sets": 3,
                      "reps": "12-15",
                      "rest": "60 sec",
                      "targetMuscles": ["chest", "shoulders"],
                      "difficulty": "BEGINNER",
                      "isSafeFor": ["KNEE_PAIN"],
                      "instructions": "...",
                      "modifications": "..."
                    }
                  ],
                  "cooldown": [{"name": "...", "duration": "5 min", "description": "..."}]
                }
              ],
              "safetyNotes": ["..."],
              "weeklyGoals": "..."
            }
            Include rest days. Make exercises progressively challenging through the week.
            """,
                name, age, gender, fitnessLevel, goal, medicalConditions, equipment, durationMin);

        String rawResponse = generateContent(prompt);
        return extractJson(rawResponse);
    }

    public String generateRecipes(String ingredients, String dietType, int targetCalories) {
        String prompt = String.format("""
            You are a professional chef and nutritionist. Generate 3 healthy recipes using these available ingredients:
            Ingredients: %s
            Diet Type: %s
            Target Calories per serving: ~%d kcal
            
            Return ONLY valid JSON:
            {
              "recipes": [
                {
                  "name": "...",
                  "description": "...",
                  "prepTime": "15 min",
                  "cookTime": "20 min",
                  "servings": 2,
                  "calories": 350,
                  "protein": 25,
                  "carbs": 40,
                  "fats": 10,
                  "ingredients": [{"item": "chicken breast", "amount": "200g"}],
                  "steps": ["Step 1...", "Step 2..."],
                  "tips": "...",
                  "tags": ["high-protein", "quick"]
                }
              ]
            }
            Make recipes practical, healthy, and delicious. Prioritize Indian recipes if applicable.
            """, ingredients, dietType, targetCalories);

        String rawResponse = generateContent(prompt, 1536, 60);
        return extractJson(rawResponse);
    }

    public String getSleepRecoverySuggestion(double sleepHours, int quality, String fitnessGoal, String medicalConditions) {
        String prompt = String.format("""
            You are a sports recovery expert. Provide personalized recovery advice based on:
            - Sleep last night: %.1f hours
            - Sleep quality: %d/5
            - Fitness Goal: %s
            - Medical Conditions: %s
            
            Provide practical, actionable advice in JSON format:
            {
              "recoveryScore": 75,
              "headline": "Good recovery, but room for improvement",
              "suggestions": [
                {"category": "Sleep", "tip": "...", "priority": "HIGH"},
                {"category": "Nutrition", "tip": "...", "priority": "MEDIUM"},
                {"category": "Exercise", "tip": "...", "priority": "LOW"}
              ],
              "tomorrowWorkout": "LIGHT | MODERATE | REST",
              "motivationalMessage": "..."
            }
            """, sleepHours, quality, fitnessGoal, medicalConditions);

        String rawResponse = generateContent(prompt, 256, 20);
        return extractJson(rawResponse);
    }

    public String chat(String userMessage, String conversationContext, String userProfile) {
        String prompt = String.format("""
            You are FitAI, an expert AI fitness and nutrition assistant for the FitForge platform.
            You are helpful, encouraging, and safety-conscious.
            
            User Profile: %s
            
            Previous conversation:
            %s
            
            User's question: %s
            
            Provide a helpful, concise, accurate response. If asked about exercises with injuries, always prioritize safety.
            Keep response under 300 words. Be conversational and motivating.
            """, userProfile, conversationContext, userMessage);

        return generateContent(prompt, 768, 45);
    }

    private boolean hasTimeoutCause(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof TimeoutException) return true;
        }
        return false;
    }

    private String extractJson(String raw) {
        // Strip markdown code blocks if present
        if (raw.contains("```json")) {
            int start = raw.indexOf("```json") + 7;
            int end = raw.lastIndexOf("```");
            if (end > start) return raw.substring(start, end).trim();
        }
        if (raw.contains("```")) {
            int start = raw.indexOf("```") + 3;
            int end = raw.lastIndexOf("```");
            if (end > start) return raw.substring(start, end).trim();
        }
        // Find first { and last }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start >= 0 && end > start) return raw.substring(start, end + 1).trim();
        return raw;
    }
}
