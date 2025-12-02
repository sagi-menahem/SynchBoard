package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for Message entity operations. Manages chat messages within
 * collaborative whiteboards, providing CRUD operations and queries for real-time messaging
 * functionality.
 *
 * The Message entity represents individual chat messages sent by users within the context of a
 * specific board. Each message includes content, timestamp, sender information, and board
 * association. This repository supports real-time chat features including message history, user
 * attribution, and data cleanup.
 *
 * @author Sagi Menahem
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    /**
     * Finds all chat messages for a specific board, ordered by timestamp in ascending order.
     * Returns messages in chronological order to support chat history display and message thread
     * continuity.
     *
     * @param boardId the unique identifier of the board
     * @return list of messages for the board, ordered from oldest to newest
     */
    List<Message> findAllByBoard_BoardGroupIdOrderByTimestampAsc(Long boardId);

    /**
     * Finds all chat messages for a specific board with sender information eagerly fetched. This
     * method loads messages along with the associated sender user details, ordered by timestamp to
     * provide complete message data for chat displays while avoiding N+1 query problems.
     *
     * @param boardId the unique identifier of the board
     * @return list of messages with sender details loaded, ordered from oldest to newest
     */
    @Query(
        "SELECT m FROM Message m LEFT JOIN FETCH m.sender WHERE m.board.boardGroupId = :boardId ORDER BY m.timestamp ASC"
    )
    List<Message> findByBoardWithSender(@Param("boardId") Long boardId);

    /**
     * Nullifies the sender reference for all messages sent by a specific user. This is used when a
     * user account is deleted to maintain data integrity while preserving the chat history and
     * message content.
     *
     * @param userEmail the email address of the user whose sender references should be nullified
     */
    @Modifying
    @Query("UPDATE Message m SET m.sender = NULL WHERE m.sender.email = :userEmail")
    void nullifySenderByUserEmail(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    /**
     * Deletes all chat messages associated with a specific board. This is typically used when a
     * board is deleted to maintain data consistency and prevent orphaned message records.
     *
     * @param boardGroupId the unique identifier of the board whose messages should be deleted
     */
    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);
}
