
// File: backend/src/main/java/com/synchboard/entity/GroupBoard.java

package com.synchboard.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "group_boards") // [cite: 206]
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing ID.
    @Column(name = "board_group_id")
    private Long boardGroupId; // [cite: 234]

    @Column(name = "board_group_name", nullable = false)
    private String boardGroupName; // [cite: 235]

    // Establishes a many-to-one relationship with the User entity.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", referencedColumnName = "email", nullable = false) // [cite: 236]
    private User createdByUser;

    @Column(name = "invite_code", unique = true)
    private String inviteCode; // [cite: 237]

    @Column(name = "group_picture_url")
    private String groupPictureUrl; // [cite: 238]

    @Column(name = "group_description")
    private String groupDescription; // [cite: 240]

    @Column(name = "creation_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date creationDate; // [cite: 239]

    @Column(name = "last_modified_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastModifiedDate; // [cite: 241]

    @PrePersist
    protected void onCreate() {
        this.creationDate = new Date();
        this.lastModifiedDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastModifiedDate = new Date();
    }
}