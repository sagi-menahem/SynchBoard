// File: backend/src/main/java/com/synchboard/backend/repository/MessageRepository.java
package com.synchboard.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.synchboard.backend.config.constants.ApiConstants;
import com.synchboard.backend.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findAllByBoard_BoardGroupIdOrderByTimestampAsc(Long boardId);

    @Modifying
    @Query("UPDATE Message m SET m.sender = NULL WHERE m.sender.email = :userEmail")
    void nullifySenderByUserEmail(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);
}
