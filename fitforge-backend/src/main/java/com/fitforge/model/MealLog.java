package com.fitforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate logDate;
    private String mealType;     // BREAKFAST, LUNCH, DINNER, SNACK
    private String foodName;
    private Integer calories;
    private Double proteinG;
    private Double carbsG;
    private Double fatsG;
    private Double servingSize;
    private String servingUnit;  // g, ml, piece, cup

    @CreationTimestamp
    private LocalDateTime createdAt;
}
