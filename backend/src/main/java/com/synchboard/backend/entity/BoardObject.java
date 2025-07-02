// File: backend/src/main/java/com/synchboard/entity/BoardObject.java

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "board_objects") // [cite: 208]
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "object_id")
    private Long objectId; // [cite: 253]

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_group_id", nullable = false) // [cite: 254]
    private GroupBoard groupBoard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_email", nullable = false) // [cite: 255]
    private User createdByUser;

    @Column(name = "object_type", nullable = false)
    private String objectType; // e.g., "SHAPE", "TEXT" [cite: 256]

    @Column(name = "creation_timestamp", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date creationTimestamp; // [cite: 257]

    @Column(name = "last_edited_timestamp")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastEditedTimestamp; // [cite: 258]
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_edited_by_user_email") // [cite: 259]
    private User lastEditedByUser;

    @Column(name = "object_data", columnDefinition = "jsonb") // Specifies the column type as jsonb for PostgreSQL. 
    private String objectData; // Stores object properties as a JSON string. 

    @PrePersist
    protected void onCreate() {
        Date now = new Date();
        this.creationTimestamp = now;
        this.lastEditedTimestamp = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastEditedTimestamp = new Date();
    }
}