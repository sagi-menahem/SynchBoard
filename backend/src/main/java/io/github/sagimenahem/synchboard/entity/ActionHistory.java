// File: backend/src/main/java/io/github/sagimenahem/synchboard/entity/ActionHistory.java
package io.github.sagimenahem.synchboard.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "action_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long actionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_id", nullable = false)
    private BoardObject boardObject;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "state_before", columnDefinition = "jsonb")
    private String stateBefore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "state_after", columnDefinition = "jsonb")
    private String stateAfter;

    @Column(name = "is_undone", nullable = false)
    private boolean isUndone;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
