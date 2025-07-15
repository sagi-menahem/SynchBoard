// File: backend/src/main/java/com/synchboard/backend/repository/GroupMemberRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    List<GroupMember> findAllByUserEmail(String userEmail);

    boolean existsByUserEmailAndBoardGroupId(String userEmail, Long boardGroupId);

    Optional<GroupMember> findByBoardGroupIdAndUserEmail(Long boardGroupId, String userEmail);

}