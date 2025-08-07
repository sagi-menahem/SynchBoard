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
    
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.groupBoard WHERE gm.userEmail = :userEmail")
    List<GroupMember> findByUserWithBoard(@Param("userEmail") String userEmail);

    boolean existsByUserEmailAndBoardGroupId(String userEmail, Long boardGroupId);

    Optional<GroupMember> findByBoardGroupIdAndUserEmail(Long boardGroupId, String userEmail);

    List<GroupMember> findAllByBoardGroupId(Long boardGroupId);

    @Transactional
    void deleteAllByBoardGroupId(Long boardGroupId);

}
