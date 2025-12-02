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
 * Entity representing the history of actions performed on board objects. This entity tracks all
 * create, update, and delete operations on board objects, allowing for undo/redo functionality and
 * audit trail purposes.
 *
 * @author Sagi Menahem
 */
@Entity
@Table(name = "action_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionHistory {

    /**
     * Unique identifier for the action history record
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long actionId;

    /**
     * The board where the action was performed
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    /**
     * The user who performed the action
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    private User user;

    /**
     * The board object that was affected by the action
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_id", nullable = false)
    private BoardObject boardObject;

    /**
     * The type of action performed (CREATE, UPDATE, DELETE)
     */
    @Column(name = "action_type", nullable = false)
    private String actionType;

    /**
     * Timestamp when the action was performed
     */
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    /**
     * JSON representation of the object state before the action
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "state_before", columnDefinition = "jsonb")
    private String stateBefore;

    /**
     * JSON representation of the object state after the action
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "state_after", columnDefinition = "jsonb")
    private String stateAfter;

    /**
     * Flag indicating whether this action has been undone
     */
    @Column(name = "is_undone", nullable = false)
    private boolean isUndone;

    /**
     * JPA lifecycle callback to set the timestamp before persisting the entity. This ensures that
     * every action history record has an accurate timestamp of when it was created.
     */
    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
