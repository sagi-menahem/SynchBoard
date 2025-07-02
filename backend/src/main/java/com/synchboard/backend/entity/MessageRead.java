// File: backend/src/main/java/com/synchboard/entity/MessageRead.java

package com.synchboard.backend.entity;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
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
@Table(name = "message_reads") // [cite: 211]
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(MessageReadId.class) // Specifies the composite PK class. 
public class MessageRead {

    @Id
    @Column(name = "message_id")
    private Long messageId; // [cite: 285]

    @Id
    @Column(name = "user_email")
    private String userEmail; // [cite: 286]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", referencedColumnName = "message_id", insertable = false, updatable = false)
    private Message message;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", insertable = false, updatable = false)
    private User user;

    @Column(name = "read_timestamp", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date readTimestamp; // [cite: 287]

    @PrePersist
    protected void onCreate() {
        this.readTimestamp = new Date();
    }
}