package com.fitforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate generatedDate;

    @Column(columnDefinition = "LONGTEXT")
    private String planJson;

    private String focusAreas;     // e.g., "Upper Body, Cardio"
    private String difficulty;     // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer estimatedDurationMin;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
