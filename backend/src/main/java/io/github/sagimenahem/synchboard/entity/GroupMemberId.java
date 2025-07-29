// File: backend/src/main/java/io/github/sagimenahem/synchboard/entity/GroupMemberId.java
package io.github.sagimenahem.synchboard.entity;

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
