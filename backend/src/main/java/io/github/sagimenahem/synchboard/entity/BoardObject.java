package io.github.sagimenahem.synchboard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entity representing objects drawn on a board (shapes, lines, text, etc.). Each board object
 * contains the visual data, positioning, and metadata necessary for rendering on the collaborative
 * whiteboard canvas.
 *
 * @author Sagi Menahem
 */
@Entity
@Table(name = "board_objects", uniqueConstraints = @UniqueConstraint(columnNames = { "instance_id", "board_group_id" }))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardObject {

    /**
     * Unique database identifier for the board object
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "object_id")
    private Long objectId;

    /**
     * Client-generated unique identifier for the object instance
     */
    @Column(name = "instance_id", nullable = false)
    private String instanceId;

    /**
     * The board this object belongs to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    /**
     * The user who created this object (may be null for system objects)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", nullable = true)
    private User createdByUser;

    /**
     * The type of object (shape, line, text, etc.)
     */
    @Column(name = "object_type", nullable = false)
    private String objectType;

    /**
     * Timestamp when the object was created
     */
    @Column(name = "creation_timestamp", nullable = false, updatable = false)
    private LocalDateTime creationTimestamp;

    /**
     * Timestamp when the object was last modified
     */
    @Column(name = "last_edited_timestamp")
    private LocalDateTime lastEditedTimestamp;

    /**
     * The user who last modified this object
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_edited_by_user_email")
    private User lastEditedByUser;

    /**
     * JSON data containing object properties (position, size, color, etc.)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "object_data", columnDefinition = "jsonb")
    private String objectData;

    /**
     * Flag indicating whether this object is active (not deleted)
     */
    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    /**
     * JPA lifecycle callback to set initial timestamps and state before persisting. Sets creation
     * and last edited timestamps to current time and marks object as active.
     */
    @PrePersist
    protected void onCreate() {
        this.creationTimestamp = LocalDateTime.now();
        this.lastEditedTimestamp = LocalDateTime.now();
        this.isActive = true;
    }

    /**
     * JPA lifecycle callback to update the last edited timestamp before updating. This ensures
     * accurate tracking of when objects were last modified.
     */
    @PreUpdate
    protected void onUpdate() {
        this.lastEditedTimestamp = LocalDateTime.now();
    }
}
