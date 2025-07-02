// File: backend/src/main/java/com/synchboard/entity/GroupMember.java

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
@Table(name = "group_members") // [cite: 207]
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(GroupMemberId.class) // Specifies the composite primary key class. 
public class GroupMember {

    @Id
    @Column(name = "user_email")
    private String userEmail; // Part of the composite key. [cite: 245]

    @Id
    @Column(name = "board_group_id")
    private Long boardGroupId; // Part of the composite key. [cite: 246]
    
    // It's good practice to also map the relationships for the composite key fields.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_email", referencedColumnName = "email", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", referencedColumnName = "board_group_id", insertable = false, updatable = false)
    private GroupBoard groupBoard;

    @Column(name = "is_admin", nullable = false)
    private Boolean isAdmin; // [cite: 247]

    @Column(name = "join_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date joinDate; // [cite: 248]

    @PrePersist
    protected void onCreate() {
        this.joinDate = new Date();
    }
}