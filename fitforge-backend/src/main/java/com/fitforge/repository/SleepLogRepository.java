package com.fitforge.repository;

import com.fitforge.model.SleepLog;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SleepLogRepository extends JpaRepository<SleepLog, Long> {
    List<SleepLog> findByUserOrderByLogDateDesc(User user);
    List<SleepLog> findByUserOrderByLogDateAsc(User user);
}
