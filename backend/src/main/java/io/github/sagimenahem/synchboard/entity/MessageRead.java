// File: backend/src/main/java/io/github/sagimenahem/synchboard/entity/MessageRead.java
package io.github.sagimenahem.synchboard.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
