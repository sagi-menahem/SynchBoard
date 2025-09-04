package io.github.sagimenahem.synchboard.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Composite primary key class for the GroupMember entity. This class represents the compound key
 * consisting of a user email and board group ID, used to uniquely identify board memberships.
 * 
 * @author Sagi Menahem
 */
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    /**
     * Email of the user who is a member of the board
     */
    private String userEmail;

    /**
     * ID of the board group the user is a member of
     */
    private Long boardGroupId;
}
