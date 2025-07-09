// File: backend/src/main/java/com/synchboard/backend/entity/GroupMember.java

package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents the join table between Users and GroupBoards.
 * It defines a user's membership in a specific board and their role (e.g.,
 * admin).
 */
@Entity
@Table(name = "group_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(GroupMemberId.class) // Specifies the composite key class
public class GroupMember {

    @Id
    @Column(name = "user_email")
    private String userEmail;

    @Id
    @Column(name = "board_group_id")
    private Long boardGroupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", referencedColumnName = "board_group_id", insertable = false, updatable = false)
    private GroupBoard groupBoard;

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin;

    @Column(name = "join_date", nullable = false, updatable = false)
    private LocalDateTime joinDate;

    @PrePersist
    protected void onCreate() {
        this.joinDate = LocalDateTime.now();
    }
}