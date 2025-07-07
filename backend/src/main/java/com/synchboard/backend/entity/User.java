// File: backend/src/main/java/com/synchboard/backend/entity/User.java

package com.synchboard.backend.entity;


import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import lombok.NoArgsConstructor;

/**
 * Represents a user entity, mapping to the "users" table in the database.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /**
     * Serves as the unique identifier (Primary Key).
     */
    @Id
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Stored as a secure hash.
     */
    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    /**
     * Flag indicating if the user is currently online. Defaults to false.
     * // TODO: Implement logic to update this status via WebSocket connection events.
     */
    @Column(name = "is_online")
    private Boolean isOnline;

    @Column(name = "status_message")
    private String statusMessage;

    /**
     * Timestamp of the user's last activity.
     * // TODO: Implement a mechanism to update this timestamp upon user activity.
     */
    @Column(name = "last_active_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastActiveDate;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "chat_background_setting")
    private String chatBackgroundSetting;

    @Column(name = "font_size_setting")
    private String fontSizeSetting;

    /**
     * Timestamp of account creation. Set automatically and cannot be updated.
     */
    @Column(name = "creation_date", updatable = false)
    private LocalDateTime creationDate;

    /**
     * Token used for verifying the user's email address.
     * // TODO: Generate and store a token here during registration and nullify it after verification.
     */
    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    /**
     * Sets the creation and last active dates automatically before the entity is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
    }
}