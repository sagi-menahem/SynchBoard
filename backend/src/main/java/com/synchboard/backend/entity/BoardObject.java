// File: backend/src/main/java/com/synchboard/backend/entity/BoardObject.java

package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode; // 1. Add this import
import org.hibernate.type.SqlTypes; // 1. Add this import

import java.time.LocalDateTime;

@Entity
@Table(name = "board_objects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "object_id")
    private Long objectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", nullable = false)
    private User createdByUser;

    @Column(name = "object_type", nullable = false)
    private String objectType;

    @Column(name = "creation_timestamp", nullable = false, updatable = false)
    private LocalDateTime creationTimestamp;

    @Column(name = "last_edited_timestamp")
    private LocalDateTime lastEditedTimestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_edited_by_user_email")
    private User lastEditedByUser;

    // 2. Add this annotation to give Hibernate the correct type hint
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "object_data", columnDefinition = "jsonb")
    private String objectData; // Stores the JSON representation of the object's properties

    @PrePersist
    protected void onCreate() {
        this.creationTimestamp = LocalDateTime.now();
        this.lastEditedTimestamp = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastEditedTimestamp = LocalDateTime.now();
    }
}