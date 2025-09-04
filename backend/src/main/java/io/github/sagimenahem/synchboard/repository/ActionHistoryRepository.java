package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.ActionHistory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {
    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(Long boardGroupId);

    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(Long boardGroupId);

    @Query(
        "SELECT ah FROM ActionHistory ah " +
        "JOIN FETCH ah.boardObject bo " +
        "JOIN FETCH ah.user " +
        "LEFT JOIN FETCH bo.createdByUser " +
        "LEFT JOIN FETCH bo.lastEditedByUser " +
        "WHERE ah.board.boardGroupId = :boardGroupId AND ah.isUndone = false " +
        "ORDER BY ah.timestamp DESC"
    )
    Optional<ActionHistory> findTopByBoardWithRelationsAndIsUndoneFalseOrderByTimestampDesc(
        @Param("boardGroupId") Long boardGroupId
    );

    @Query(
        "SELECT ah FROM ActionHistory ah " +
        "JOIN FETCH ah.boardObject bo " +
        "JOIN FETCH ah.user " +
        "LEFT JOIN FETCH bo.createdByUser " +
        "LEFT JOIN FETCH bo.lastEditedByUser " +
        "WHERE ah.board.boardGroupId = :boardGroupId AND ah.isUndone = true " +
        "ORDER BY ah.timestamp DESC"
    )
    Optional<ActionHistory> findTopByBoardWithRelationsAndIsUndoneTrueOrderByTimestampDesc(
        @Param("boardGroupId") Long boardGroupId
    );

    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    @Transactional
    void deleteAllByUser_Email(String userEmail);
}
