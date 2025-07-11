// File: backend/src/main/java/com/synchboard/backend/entity/GroupMemberId.java
package com.synchboard.backend.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Represents the composite primary key for the {@link GroupMember} entity.
 * It consists of the user's email and the group board's ID.
 */
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    private String userEmail;
    private Long boardGroupId;
}