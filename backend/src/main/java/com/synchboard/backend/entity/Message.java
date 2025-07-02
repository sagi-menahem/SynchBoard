// File: backend/src/main/java/com/synchboard/entity/Message.java

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
@Table(name = "messages") // [cite: 209]
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId; // [cite: 264]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false) // [cite: 265]
    private GroupBoard groupBoard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_email", nullable = false) // [cite: 266]
    private User sender;

    @Column(nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp; // [cite: 267]

    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent; // [cite: 268]

    @PrePersist
    protected void onCreate() {
        this.timestamp = new Date();
    }
}