// File: backend/src/main/java/com/synchboard/backend/entity/GroupBoard.java

package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents a group board entity, mapping to the "group_boards" table in the
 * database.
 */
@Entity
@Table(name = "group_boards")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_group_id")
    private Long boardGroupId;

    @Column(name = "board_group_name", nullable = false)
    private String boardGroupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", referencedColumnName = "email", nullable = false)
    private User createdByUser;

    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Column(name = "group_picture_url")
    private String groupPictureUrl;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "group_description")
    private String groupDescription;

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    /**
     * Sets the creation and last modified timestamps before the entity is first
     * persisted.
     */
    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
        this.lastModifiedDate = LocalDateTime.now();
    }

    /**
     * Updates the last modified timestamp before the entity is updated.
     */
    @PreUpdate
    protected void onUpdate() {
        this.lastModifiedDate = LocalDateTime.now();
    }
}