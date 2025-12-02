package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.GroupMemberId;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for GroupMember entity operations. Manages the many-to-many
 * relationship between users and collaborative boards, including member permissions, roles, and
 * access control.
 *
 * The GroupMember entity represents the association between a User and a GroupBoard, storing
 * membership information such as join date, role permissions, and access levels. This repository
 * supports member management operations including invitations, permission queries, and membership
 * validation for collaborative features.
 *
 * @author Sagi Menahem
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    /**
     * Finds all board memberships for a specific user. Returns all boards that the user is a member
     * of, regardless of their role.
     *
     * @param userEmail the email address of the user
     * @return list of all group memberships for the user
     */
    List<GroupMember> findAllByUserEmail(String userEmail);

    /**
     * Finds all board memberships for a specific user with board details eagerly fetched. This
     * method loads memberships along with the associated board information, ordered by the board's
     * last modification date (most recent first) to support "recently accessed boards"
     * functionality.
     *
     * @param userEmail the email address of the user
     * @return list of group memberships with board details, ordered by last modification date
     */
    @Query(
        "SELECT gm FROM GroupMember gm JOIN FETCH gm.groupBoard gb WHERE gm.userEmail = :userEmail ORDER BY gb.lastModifiedDate DESC"
    )
    List<GroupMember> findByUserWithBoard(@Param("userEmail") String userEmail);

    /**
     * Checks if a user is a member of a specific board. Used for authorization and access control
     * to determine if a user has permission to access board resources.
     *
     * @param userEmail the email address of the user
     * @param boardGroupId the unique identifier of the board
     * @return true if the user is a member of the board, false otherwise
     */
    boolean existsByUserEmailAndBoardGroupId(String userEmail, Long boardGroupId);

    /**
     * Finds a specific membership record for a user and board combination. Used to retrieve
     * membership details including role and permissions for authorization and member management
     * operations.
     *
     * @param boardGroupId the unique identifier of the board
     * @param userEmail the email address of the user
     * @return an Optional containing the membership record, or empty if not found
     */
    Optional<GroupMember> findByBoardGroupIdAndUserEmail(Long boardGroupId, String userEmail);

    /**
     * Finds all members of a specific board. Returns basic membership information without eager
     * loading related entities.
     *
     * @param boardGroupId the unique identifier of the board
     * @return list of all members for the specified board
     */
    List<GroupMember> findAllByBoardGroupId(Long boardGroupId);

    /**
     * Finds all members of a specific board with user information eagerly fetched. This method
     * loads membership records along with user details to support member management interfaces and
     * avoid N+1 query problems.
     *
     * @param boardGroupId the unique identifier of the board
     * @return list of board members with user information loaded
     */
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.boardGroupId = :boardGroupId")
    List<GroupMember> findAllByBoardGroupIdWithUser(@Param("boardGroupId") Long boardGroupId);

    /**
     * Deletes all memberships associated with a specific board. This is typically used when a board
     * is deleted to maintain data consistency and remove all member associations.
     *
     * @param boardGroupId the unique identifier of the board whose memberships should be deleted
     */
    @Transactional
    void deleteAllByBoardGroupId(Long boardGroupId);

    /**
     * Retrieves email addresses of all members of a specific board. This is used for notification
     * systems, member invitation features, and real-time collaboration user lists.
     *
     * @param boardId the unique identifier of the board
     * @return list of email addresses of all board members
     */
    @Query("SELECT gm.userEmail FROM GroupMember gm WHERE gm.boardGroupId = :boardId")
    List<String> findEmailsByBoardId(@Param("boardId") Long boardId);
}
