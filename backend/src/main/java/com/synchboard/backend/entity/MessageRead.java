// File: backend/src/main/java/com/synchboard/backend/entity/MessageRead.java
package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_reads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(MessageReadId.class)
public class MessageRead {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", referencedColumnName = "message_id")
    private Message message;

    @Id
    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "read_timestamp", nullable = false, updatable = false)
    private LocalDateTime readTimestamp;

    @PrePersist
    protected void onCreate() {
        this.readTimestamp = LocalDateTime.now();
    }
}