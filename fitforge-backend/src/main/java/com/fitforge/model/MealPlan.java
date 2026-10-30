package com.fitforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate generatedDate;

    @Column(columnDefinition = "LONGTEXT")
    private String planJson;   // Full AI-generated plan as JSON string

    private Integer totalCalories;
    private Double proteinG;
    private Double carbsG;
    private Double fatsG;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
