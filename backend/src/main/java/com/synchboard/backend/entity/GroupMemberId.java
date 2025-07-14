// File: backend/src/main/java/com/synchboard/backend/entity/GroupMemberId.java
package com.synchboard.backend.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    private String userEmail;
    private Long boardGroupId;
}