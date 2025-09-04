package io.github.sagimenahem.synchboard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing chat messages within collaborative boards. Stores message content, sender
 * information, timestamps, and board associations for real-time chat functionality in whiteboard
 * sessions.
 * 
 * @author Sagi Menahem
 */
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

    @Column(name = "sender_full_name_snapshot", nullable = false)
    private String senderFullNameSnapshot;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
