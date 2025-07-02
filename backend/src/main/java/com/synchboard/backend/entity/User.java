// File: backend/src/main/java/com/synchboard/entity/User.java

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
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // Maps this class to the "users" table in the database. [cite: 205]
@Data // Lombok annotation to generate getters, setters, toString, equals, and hashCode.
@NoArgsConstructor // Lombok annotation for a no-argument constructor.
@AllArgsConstructor // Lombok annotation for a constructor with all arguments.
public class User {

    @Id // Marks this field as the primary key. [cite: 218]
    @Column(nullable = false, unique = true)
    private String email; // [cite: 218]

    @Column(nullable = false)
    private String password; // [cite: 219]

    @Column(name = "first_name", nullable = false)
    private String firstName; // [cite: 221]

    @Column(name = "last_name", nullable = false)
    private String lastName; // [cite: 220]

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber; // [cite: 225]

    @Column(name = "is_online")
    private Boolean isOnline; // [cite: 222]

    @Column(name = "status_message")
    private String statusMessage; // [cite: 223]

    @Column(name = "last_active_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastActiveDate; // [cite: 224]

    @Column(name = "profile_picture_url")
    private String profilePictureUrl; // [cite: 226]

    @Column(name = "chat_background_setting")
    private String chatBackgroundSetting; // [cite: 227]

    @Column(name = "font_size_setting")
    private String fontSizeSetting; // [cite: 228]

    @Column(name = "creation_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date creationDate; // [cite: 229]

    @Column(name = "email_verification_token")
    private String emailVerificationToken; // [cite: 230]

    @PrePersist
    protected void onCreate() {
        this.creationDate = new Date();
    }
}