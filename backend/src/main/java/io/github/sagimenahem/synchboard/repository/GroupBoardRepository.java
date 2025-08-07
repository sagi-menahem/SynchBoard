package io.github.sagimenahem.synchboard.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import io.github.sagimenahem.synchboard.config.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import io.github.sagimenahem.synchboard.entity.GroupMember;

@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {

    @Modifying
    @Query("UPDATE GroupBoard gb SET gb.createdByUser = NULL WHERE gb.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    @Query("SELECT DISTINCT gm FROM GroupMember gm " +
           "JOIN FETCH gm.groupBoard " +
           "JOIN FETCH gm.user " +
           "WHERE gm.boardGroupId = :boardId")
    List<GroupMember> findMembersWithDetails(@Param("boardId") Long boardId);
}
