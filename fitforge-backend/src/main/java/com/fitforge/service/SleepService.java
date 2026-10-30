package com.fitforge.service;

import com.fitforge.model.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SleepService {

    private final GeminiService geminiService;
    private final UserService userService;
    private final SleepLogRepository sleepLogRepository;
    private final HealthProfileRepository healthProfileRepository;

    @Transactional
    public SleepLog logSleep(String email, SleepLog logData) {
        User user = userService.getCurrentUser(email);
        logData.setUser(user);
        if (logData.getLogDate() == null) logData.setLogDate(LocalDate.now());

        // Get AI recovery suggestion
        HealthProfile profile = healthProfileRepository.findByUserId(user.getId()).orElse(null);
        String fitnessGoal = profile != null && profile.getFitnessGoal() != null
                ? profile.getFitnessGoal()
                : "General Fitness";
        String medicalConditions = profile != null && profile.getMedicalConditions() != null
                && !profile.getMedicalConditions().isBlank()
                ? profile.getMedicalConditions()
                : "None";
        String suggestion;
        try {
            suggestion = geminiService.getSleepRecoverySuggestion(
                    logData.getSleepHours(), logData.getQuality(), fitnessGoal, medicalConditions);
        } catch (RuntimeException exception) {
            log.warn("Sleep entry saved without AI recovery advice ({})", exception.getClass().getSimpleName());
            suggestion = "Your sleep entry was saved. AI recovery advice is temporarily unavailable; please try again later.";
        }
        logData.setAiRecoverySuggestion(suggestion);

        return sleepLogRepository.save(logData);
    }

    public List<SleepLog> getSleepHistory(String email) {
        User user = userService.getCurrentUser(email);
        return sleepLogRepository.findByUserOrderByLogDateAsc(user);
    }
}
