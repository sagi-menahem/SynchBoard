// File: backend/src/main/java/com/synchboard/entity/GroupMemberId.java

package com.synchboard.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// This class represents the composite primary key for the GroupMember entity.
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberId implements Serializable {
    private String userEmail; // Corresponds to user_email foreign key. [cite: 245]
    private Long boardGroupId; // Corresponds to board_group_id foreign key. [cite: 246]

    // equals and hashCode are essential for composite keys.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GroupMemberId that = (GroupMemberId) o;
        return Objects.equals(userEmail, that.userEmail) && Objects.equals(boardGroupId, that.boardGroupId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userEmail, boardGroupId);
    }
}