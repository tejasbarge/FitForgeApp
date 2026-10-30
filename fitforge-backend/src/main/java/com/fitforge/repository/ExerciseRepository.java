package com.fitforge.repository;

import com.fitforge.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByActiveTrueOrderBySplitCategoryAscNameAsc();
    boolean existsByName(String name);
}
