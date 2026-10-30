package com.fitforge.repository;

import com.fitforge.model.WaterLog;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    Optional<WaterLog> findByUserAndLogDate(User user, LocalDate date);
    List<WaterLog> findByUserAndLogDateBetweenOrderByLogDateAsc(User user, LocalDate start, LocalDate end);
}
