package com.fitforge.repository;

import com.fitforge.model.HealthProfile;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HealthProfileRepository extends JpaRepository<HealthProfile, Long> {
    Optional<HealthProfile> findByUser(User user);
    Optional<HealthProfile> findByUserId(Long userId);
}
