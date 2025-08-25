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
@Table(name = "board_objects", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"instance_id", "board_group_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "object_id")
    private Long objectId;

    @Column(name = "instance_id", nullable = false)
    private String instanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", nullable = true)
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "object_data", columnDefinition = "jsonb")
    private String objectData;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        this.creationTimestamp = LocalDateTime.now();
        this.lastEditedTimestamp = LocalDateTime.now();
        this.isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastEditedTimestamp = LocalDateTime.now();
    }
}
