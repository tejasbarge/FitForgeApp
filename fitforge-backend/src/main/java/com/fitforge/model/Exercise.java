package com.fitforge.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercises", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 80)
    private String muscleGroup;

    @Column(nullable = false, length = 20)
    private String difficulty;

    @Column(nullable = false, length = 80)
    private String requiredEquipment;

    @Column(nullable = false, length = 30)
    private String splitCategory;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false, length = 30)
    private String reps;

    @Column(nullable = false, length = 30)
    private String restTime;

    @Column(nullable = false, length = 1000)
    private String instructions;

    @Column(length = 200)
    private String restrictionTags;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
