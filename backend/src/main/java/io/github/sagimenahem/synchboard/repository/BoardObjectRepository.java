package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.BoardObject;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for BoardObject entity operations. Manages canvas objects
 * (shapes, lines, text, etc.) within collaborative whiteboards, providing CRUD operations and
 * queries for board content management.
 *
 * The BoardObject entity represents individual drawing elements on a whiteboard, including their
 * visual properties, position, creation metadata, and active status. This repository supports
 * real-time collaborative editing by managing object lifecycle and user attribution for all canvas
 * elements.
 *
 * @author Sagi Menahem
 */
@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {
    /**
     * Finds all active board objects for a specific board. Only returns objects that have not been
     * soft-deleted (isActive = true).
     *
     * @param boardGroupId the unique identifier of the board
     * @return list of active board objects for the specified board
     */
    List<BoardObject> findAllByBoard_BoardGroupIdAndIsActiveTrue(Long boardGroupId);

    /**
     * Finds all active board objects for a specific board with user information eagerly fetched.
     * This method loads board objects along with their creation and last-edit user information to
     * avoid N+1 query problems when displaying object attribution.
     *
     * @param boardGroupId the unique identifier of the board
     * @return list of active board objects with user information loaded
     */
    @Query(
        "SELECT bo FROM BoardObject bo LEFT JOIN FETCH bo.createdByUser LEFT JOIN FETCH bo.lastEditedByUser WHERE bo.board.boardGroupId = :boardGroupId AND bo.isActive = true"
    )
    List<BoardObject> findActiveByBoardWithUsers(@Param("boardGroupId") Long boardGroupId);

    /**
     * Finds a board object by its instance ID within a specific board and active status. The
     * instance ID is a unique identifier used for real-time synchronization between clients to
     * identify the same object across different sessions.
     *
     * @param instanceId the unique instance identifier of the object
     * @param board the board containing the object
     * @param isActive whether to search for active or inactive objects
     * @return an Optional containing the matching board object, or empty if none found
     */
    Optional<BoardObject> findByInstanceIdAndBoardAndIsActive(String instanceId, GroupBoard board, boolean isActive);

    /**
     * Deletes all board objects associated with a specific board. This is typically used when a
     * board is deleted to maintain data consistency and prevent orphaned board object records.
     *
     * @param boardGroupId the unique identifier of the board whose objects should be deleted
     */
    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    /**
     * Nullifies the createdByUser reference for all board objects created by a specific user. This
     * is used when a user account is deleted to maintain data integrity while preserving the board
     * objects they created.
     *
     * @param userEmail the email address of the user whose creation references should be nullified
     */
    @Modifying
    @Query("UPDATE BoardObject bo SET bo.createdByUser = NULL WHERE bo.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    /**
     * Nullifies the lastEditedByUser reference for all board objects last edited by a specific
     * user. This is used when a user account is deleted to maintain data integrity while preserving
     * the board objects they last modified.
     *
     * @param userEmail the email address of the user whose edit references should be nullified
     */
    @Modifying
    @Query("UPDATE BoardObject bo SET bo.lastEditedByUser = NULL WHERE bo.lastEditedByUser.email = :userEmail")
    void nullifyLastEditedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);
}
