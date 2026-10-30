package com.fitforge.service;

import com.fitforge.model.*;
import com.fitforge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;
    private final UserService userService;
    private final ChatMessageRepository chatMessageRepository;
    private final HealthProfileRepository healthProfileRepository;

    @Transactional
    public ChatMessage sendMessage(String email, String userMessage) {
        User user = userService.getCurrentUser(email);

        // Save user message
        ChatMessage userMsg = ChatMessage.builder()
                .user(user)
                .role("user")
                .message(userMessage)
                .build();
        chatMessageRepository.save(userMsg);

        // Build context from recent history
        List<ChatMessage> history = chatMessageRepository.findTop50ByUserOrderByTimestampDesc(user);
        StringBuilder context = new StringBuilder();
        // The newest entry is the message just saved above; pass it separately in the prompt.
        for (int i = Math.min(history.size() - 1, 4); i >= 1; i--) {
            ChatMessage msg = history.get(i);
            context.append(msg.getRole()).append(": ").append(msg.getMessage()).append("\n");
        }

        // Build profile summary
        String profileSummary = healthProfileRepository.findByUserId(user.getId())
                .map(p -> String.format("Goal: %s, Diet: %s, Conditions: %s, Calories: %d/day",
                        p.getFitnessGoal(), p.getDietType(),
                        p.getMedicalConditions() != null ? p.getMedicalConditions() : "None",
                        p.getDailyCalorieTarget()))
                .orElse("Profile not set up yet");

        // Get AI response
        String aiResponse = geminiService.chat(userMessage, context.toString(), profileSummary);

        // Save AI response
        ChatMessage aiMsg = ChatMessage.builder()
                .user(user)
                .role("assistant")
                .message(aiResponse)
                .build();
        return chatMessageRepository.save(aiMsg);
    }

    public List<ChatMessage> getChatHistory(String email) {
        User user = userService.getCurrentUser(email);
        return chatMessageRepository.findByUserOrderByTimestampAsc(user);
    }

    @Transactional
    public void clearHistory(String email) {
        User user = userService.getCurrentUser(email);
        chatMessageRepository.deleteByUser(user);
    }
}
