package com.fitforge.repository;

import com.fitforge.model.WeightLog;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    List<WeightLog> findByUserOrderByLogDateAsc(User user);
    Optional<WeightLog> findTopByUserOrderByLogDateDesc(User user);
}
