// File: backend/src/main/java/com/synchboard/backend/repository/ActionHistoryRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.ActionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {

    /**
     * Finds the most recent action for a given board that has NOT been undone.
     * Used for the "Undo" operation.
     */
    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(Long boardGroupId);

    /**
     * Finds the most recent action for a given board that HAS been undone.
     * Used for the "Redo" operation. We order by timestamp descending to get the
     * last undone action.
     */
    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(Long boardGroupId);
}