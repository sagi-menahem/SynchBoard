// File: backend/src/main/java/com/synchboard/backend/entity/GroupMember.java
package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents the membership of a User in a GroupBoard.
 * This entity defines the relationship between users and boards, including
 * roles (e.g., admin).
 * It uses a composite primary key defined in {@link GroupMemberId}.
 */
@Entity
@Table(name = "group_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(GroupMemberId.class)
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

    /**
     * Sets the join date before the entity is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        this.joinDate = LocalDateTime.now();
    }
}