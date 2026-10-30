package com.fitforge.repository;

import com.fitforge.model.MealPlan;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    Optional<MealPlan> findTopByUserOrderByGeneratedDateDesc(User user);
    List<MealPlan> findByUserOrderByGeneratedDateDesc(User user);
    Optional<MealPlan> findByUserAndGeneratedDate(User user, LocalDate date);
}
