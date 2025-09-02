package io.github.sagimenahem.synchboard.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.entity.GroupMember;
import io.github.sagimenahem.synchboard.entity.GroupMemberId;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findAllByUserEmail(String userEmail);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.groupBoard gb WHERE gm.userEmail = :userEmail ORDER BY gb.lastModifiedDate DESC")
    List<GroupMember> findByUserWithBoard(@Param("userEmail") String userEmail);

    boolean existsByUserEmailAndBoardGroupId(String userEmail, Long boardGroupId);

    Optional<GroupMember> findByBoardGroupIdAndUserEmail(Long boardGroupId, String userEmail);

    List<GroupMember> findAllByBoardGroupId(Long boardGroupId);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.boardGroupId = :boardGroupId")
    List<GroupMember> findAllByBoardGroupIdWithUser(@Param("boardGroupId") Long boardGroupId);

    @Transactional
    void deleteAllByBoardGroupId(Long boardGroupId);

    @Query("SELECT gm.userEmail FROM GroupMember gm WHERE gm.boardGroupId = :boardId")
    List<String> findEmailsByBoardId(@Param("boardId") Long boardId);

}
