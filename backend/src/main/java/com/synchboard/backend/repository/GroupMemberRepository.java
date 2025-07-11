// File: backend/src/main/java/com/synchboard/backend/repository/GroupMemberRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link GroupMember} entities.
 * The primary key is a composite key of type {@link GroupMemberId}.
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    /**
     * Finds all group memberships for a given user email.
     *
     * @param userEmail the email of the user.
     * @return a list of group memberships for the user.
     */
    List<GroupMember> findAllByUserEmail(String userEmail);
}