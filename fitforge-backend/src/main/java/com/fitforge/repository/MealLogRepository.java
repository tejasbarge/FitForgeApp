package com.fitforge.repository;

import com.fitforge.model.MealLog;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    List<MealLog> findByUserAndLogDate(User user, LocalDate date);
    List<MealLog> findByUserAndLogDateBetweenOrderByLogDateAsc(User user, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(m.calories), 0) FROM MealLog m WHERE m.user = :user AND m.logDate = :date")
    Integer sumCaloriesByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
}
