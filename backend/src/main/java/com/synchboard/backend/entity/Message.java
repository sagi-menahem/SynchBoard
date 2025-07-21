// File: backend/src/main/java/com/synchboard/backend/entity/Message.java
package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false)
    private GroupBoard board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_email", nullable = true)
    private User sender;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}