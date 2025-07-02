// File: backend/src/main/java/com/synchboard/entity/ActionHistory.java

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
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "action_history") // [cite: 210]
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long actionId; // [cite: 272]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false) // [cite: 273]
    private GroupBoard groupBoard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false) // [cite: 274]
    private User user;

    @Column(name = "action_type", nullable = false)
    private String actionType; // e.g., "CREATE", "UPDATE", "DELETE" [cite: 275]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_id", nullable = false) // [cite: 276]
    private BoardObject boardObject;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp; // [cite: 277]

    // Stores the state of the object *before* the action. [cite: 278]
    @Column(name = "state_before", columnDefinition = "jsonb") // [cite: 279]
    private String stateBefore;

    // Stores the state of the object *after* the action. [cite: 280]
    @Column(name = "state_after", columnDefinition = "jsonb") // [cite: 281]
    private String stateAfter;

    @PrePersist
    protected void onCreate() {
        this.timestamp = new Date();
    }
}