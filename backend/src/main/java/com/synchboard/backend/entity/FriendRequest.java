// File: backend/src/main/java/com/synchboard/entity/FriendRequest.java

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
@Table(name = "friend_requests") // [cite: 212]
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(FriendRequestId.class) // Specifies the composite PK class. [cite: 296]
public class FriendRequest {

    @Id
    @Column(name = "requesting_user_email")
    private String requestingUserEmail; // [cite: 292]

    @Id
    @Column(name = "requested_user_email")
    private String requestedUserEmail; // [cite: 293]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requesting_user_email", referencedColumnName = "email", insertable = false, updatable = false)
    private User requestingUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_user_email", referencedColumnName = "email", insertable = false, updatable = false)
    private User requestedUser;

    @Column(nullable = false)
    private String status; // "pending", "accepted", "declined" [cite: 294]

    @Column(name = "request_timestamp", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date requestTimestamp; // [cite: 295]

    @PrePersist
    protected void onCreate() {
        this.requestTimestamp = new Date();
    }
}