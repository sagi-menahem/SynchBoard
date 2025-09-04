package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for GroupBoard entity operations. Manages collaborative
 * whiteboard instances, providing CRUD operations and queries for board management and member
 * access.
 * 
 * The GroupBoard entity represents individual whiteboard instances that can be shared among
 * multiple users. Each board has an owner, creation metadata, modification tracking, and associated
 * members with different permission levels. This repository supports board lifecycle management and
 * member relationship queries.
 * 
 * @author Sagi Menahem
 */
@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {

    /**
     * Nullifies the createdByUser reference for all boards created by a specific user. This is used
     * when a user account is deleted to maintain data integrity while preserving the boards they
     * created.
     * 
     * @param userEmail the email address of the user whose creation references should be nullified
     */
    @Modifying
    @Query("UPDATE GroupBoard gb SET gb.createdByUser = NULL WHERE gb.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    /**
     * Finds all members of a specific board with their complete details eagerly fetched. This
     * method loads member information along with the associated board and user entities to provide
     * comprehensive member data for board management operations.
     * 
     * @param boardId the unique identifier of the board
     * @return list of group members with board and user details loaded
     */
    @Query("SELECT DISTINCT gm FROM GroupMember gm " + "JOIN FETCH gm.groupBoard "
            + "JOIN FETCH gm.user " + "WHERE gm.boardGroupId = :boardId")
    List<GroupMember> findMembersWithDetails(@Param("boardId") Long boardId);

    /**
     * Updates the last modified date of a specific board to the current timestamp. This is
     * typically called when any content on the board is modified to track board activity and
     * support features like "recently modified" board lists.
     * 
     * @param boardId the unique identifier of the board to update
     */
    @Modifying
    @Transactional
    @Query("UPDATE GroupBoard gb SET gb.lastModifiedDate = CURRENT_TIMESTAMP WHERE gb.boardGroupId = :boardId")
    void updateLastModifiedDate(@Param("boardId") Long boardId);
}
