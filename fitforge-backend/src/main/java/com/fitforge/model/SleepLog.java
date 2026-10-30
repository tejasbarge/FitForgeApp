package com.fitforge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sleep_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private LocalDate logDate;
    private Double sleepHours;
    private Integer quality;        // 1 (poor) to 5 (excellent)
    private String bedtime;         // e.g., "22:30"
    private String wakeTime;        // e.g., "06:30"

    @Column(columnDefinition = "TEXT")
    private String aiRecoverySuggestion;

    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
