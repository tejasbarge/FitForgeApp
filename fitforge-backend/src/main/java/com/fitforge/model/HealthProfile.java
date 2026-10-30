package com.fitforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "health_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    private Integer age;
    private String gender;           // MALE, FEMALE, OTHER
    private Double heightCm;
    private Double weightKg;
    private Double targetWeightKg;

    private String fitnessGoal;      // WEIGHT_LOSS, MUSCLE_GAIN, MAINTENANCE, ENDURANCE
    private String activityLevel;    // SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE
    private String dietType;         // VEGETARIAN, VEGAN, NON_VEG, HIGH_PROTEIN, LOW_CARB
    private String fitnessLevel;     // BEGINNER, INTERMEDIATE, ADVANCED
    private String availableEquipment;
    @Builder.Default
    private String workoutSplit = "FULL_BODY";
    @Builder.Default
    private Integer workoutDurationMin = 45;

    @Column(columnDefinition = "TEXT")
    private String medicalConditions; // comma-separated: KNEE_PAIN, HYPERTENSION, ASTHMA, BACK_PAIN, NONE

    @Column(columnDefinition = "TEXT")
    private String allergies;         // comma-separated food allergies

    // Calculated fields
    private Double bmr;
    private Double tdee;
    private Integer dailyCalorieTarget;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
