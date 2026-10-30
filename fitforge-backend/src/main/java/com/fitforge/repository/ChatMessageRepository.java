package com.fitforge.repository;

import com.fitforge.model.ChatMessage;
import com.fitforge.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserOrderByTimestampAsc(User user);
    List<ChatMessage> findTop50ByUserOrderByTimestampDesc(User user);
    void deleteByUser(User user);
}
