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

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "is_online")
    private Boolean isOnline;

    @Column(name = "status_message")
    private String statusMessage;

    @Column(name = "last_active_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastActiveDate;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "chat_background_setting")
    private String chatBackgroundSetting;

    @Column(name = "font_size_setting")
    private String fontSizeSetting;

    @Column(name = "creation_date", updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
    }
}