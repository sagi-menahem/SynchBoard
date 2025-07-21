// File: backend/src/main/java/com/synchboard/backend/repository/ActionHistoryRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.ActionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {

    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(Long boardGroupId);

    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(Long boardGroupId);

    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    @Transactional
    void deleteAllByUser_Email(String userEmail);
}