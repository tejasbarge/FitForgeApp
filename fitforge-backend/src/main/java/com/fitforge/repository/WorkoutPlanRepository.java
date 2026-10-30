package com.fitforge.repository;

import com.fitforge.model.WorkoutPlan;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    Optional<WorkoutPlan> findTopByUserOrderByCreatedAtDesc(User user);
    List<WorkoutPlan> findByUserOrderByGeneratedDateDesc(User user);
}
