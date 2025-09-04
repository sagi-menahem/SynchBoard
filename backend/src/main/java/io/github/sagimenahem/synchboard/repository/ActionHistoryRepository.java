package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.ActionHistory;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for ActionHistory entity operations. Manages the audit trail
 * of user actions performed on board objects, supporting undo/redo functionality in the
 * collaborative whiteboard application.
 * 
 * The ActionHistory entity tracks all create, update, and delete operations performed on board
 * objects, including the user who performed the action, the timestamp, and whether the action has
 * been undone. This enables comprehensive action tracking and undo/redo capabilities.
 * 
 * @author Sagi Menahem
 */
@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {

    /**
     * Finds the most recent action that has not been undone for a specific board. Used to determine
     * the last performed action when implementing undo functionality.
     * 
     * @param boardGroupId the unique identifier of the board
     * @return an Optional containing the most recent undone action, or empty if none found
     */
    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneFalseOrderByTimestampDesc(
            Long boardGroupId);

    /**
     * Finds the most recent action that has been undone for a specific board. Used to determine the
     * last undone action when implementing redo functionality.
     * 
     * @param boardGroupId the unique identifier of the board
     * @return an Optional containing the most recent undone action, or empty if none found
     */
    Optional<ActionHistory> findTopByBoard_BoardGroupIdAndIsUndoneTrueOrderByTimestampDesc(
            Long boardGroupId);

    /**
     * Finds the most recent action that has not been undone for a specific board, eagerly fetching
     * all related entities to avoid N+1 queries. This method loads the action history along with
     * the associated board object, user who performed the action, and board object creation/editing
     * users.
     * 
     * @param boardGroupId the unique identifier of the board
     * @return an Optional containing the most recent undone action with all relations loaded, or
     *         empty if none found
     */
    @Query("SELECT ah FROM ActionHistory ah " + "JOIN FETCH ah.boardObject bo "
            + "JOIN FETCH ah.user " + "LEFT JOIN FETCH bo.createdByUser "
            + "LEFT JOIN FETCH bo.lastEditedByUser "
            + "WHERE ah.board.boardGroupId = :boardGroupId AND ah.isUndone = false "
            + "ORDER BY ah.timestamp DESC")
    Optional<ActionHistory> findTopByBoardWithRelationsAndIsUndoneFalseOrderByTimestampDesc(
            @Param("boardGroupId") Long boardGroupId);

    /**
     * Finds the most recent action that has been undone for a specific board, eagerly fetching all
     * related entities to avoid N+1 queries. This method loads the action history along with the
     * associated board object, user who performed the action, and board object creation/editing
     * users.
     * 
     * @param boardGroupId the unique identifier of the board
     * @return an Optional containing the most recent undone action with all relations loaded, or
     *         empty if none found
     */
    @Query("SELECT ah FROM ActionHistory ah " + "JOIN FETCH ah.boardObject bo "
            + "JOIN FETCH ah.user " + "LEFT JOIN FETCH bo.createdByUser "
            + "LEFT JOIN FETCH bo.lastEditedByUser "
            + "WHERE ah.board.boardGroupId = :boardGroupId AND ah.isUndone = true "
            + "ORDER BY ah.timestamp DESC")
    Optional<ActionHistory> findTopByBoardWithRelationsAndIsUndoneTrueOrderByTimestampDesc(
            @Param("boardGroupId") Long boardGroupId);

    /**
     * Deletes all action history records associated with a specific board. This is typically used
     * when a board is deleted to maintain data consistency and prevent orphaned action history
     * records.
     * 
     * @param boardGroupId the unique identifier of the board whose history should be deleted
     */
    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    /**
     * Deletes all action history records associated with a specific user. This is typically used
     * when a user account is deleted to maintain data consistency and comply with data retention
     * policies.
     * 
     * @param userEmail the email address of the user whose action history should be deleted
     */
    @Transactional
    void deleteAllByUser_Email(String userEmail);
}
