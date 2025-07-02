// File: backend/src/main/java/com/synchboard/entity/Friend.java

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
@Table(name = "friends") // [cite: 213]
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(FriendId.class) // Specifies the composite PK class. [cite: 303]
public class Friend {

    @Id
    @Column(name = "user_email_1")
    private String userEmail1; // [cite: 300]

    @Id
    @Column(name = "user_email_2")
    private String userEmail2; // [cite: 301]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email_1", referencedColumnName = "email", insertable = false, updatable = false)
    private User user1;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email_2", referencedColumnName = "email", insertable = false, updatable = false)
    private User user2;

    @Column(name = "friendship_date", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date friendshipDate; // [cite: 302]

    @PrePersist
    protected void onCreate() {
        this.friendshipDate = new Date();
        // Enforce the constraint that userEmail1 is lexicographically smaller than userEmail2 to prevent duplicates. [cite: 304]
        if (userEmail1.compareTo(userEmail2) > 0) {
            String temp = this.userEmail1;
            this.userEmail1 = this.userEmail2;
            this.userEmail2 = temp;
        }
    }
}