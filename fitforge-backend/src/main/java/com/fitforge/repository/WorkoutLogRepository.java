package com.fitforge.repository;

import com.fitforge.model.WorkoutLog;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserAndLogDate(User user, LocalDate date);
    List<WorkoutLog> findByUserAndLogDateBetween(User user, LocalDate start, LocalDate end);
    List<WorkoutLog> findByUserAndLogDateBetweenOrderByLogDateAscCreatedAtAsc(User user, LocalDate start, LocalDate end);
    long countByUserAndLogDateBetweenAndCompletedTrue(User user, LocalDate start, LocalDate end);
}
