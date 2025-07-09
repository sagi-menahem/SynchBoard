// File: backend/src/main/java/com/synchboard/backend/repository/GroupMemberRepository.java

package com.synchboard.backend.repository;

import com.synchboard.backend.entity.GroupMember;
import com.synchboard.backend.entity.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the {@link GroupMember} entity.
 * The primary key is the composite key {@link GroupMemberId}.
 */
@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {

    /**
     * Finds all group memberships for a specific user by their email.
     * Spring Data JPA automatically generates the query from the method name.
     *
     * @param userEmail The email of the user.
     * @return A list of {@link GroupMember} entities associated with the user.
     */
    List<GroupMember> findAllByUserEmail(String userEmail);
}