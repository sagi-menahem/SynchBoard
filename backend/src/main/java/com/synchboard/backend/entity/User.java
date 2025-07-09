// Located at: backend/src/main/java/com/synchboard/backend/entity/User.java

package com.synchboard.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.List;

/**
 * Represents a user entity, mapping to the "users" table in the database.
 * Implements UserDetails to integrate with Spring Security.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

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

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
    }

    /**
     * Returns the authorities granted to the user.
     * For now, we are granting a simple "ROLE_USER" to every user.
     * 
     * @return A collection of authorities.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // In a more complex app, roles would be stored in the database.
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    /**
     * Returns the username used to authenticate the user.
     * In our case, the email is the username.
     * 
     * @return The user's email.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Indicates whether the user's account has expired.
     * An expired account cannot be authenticated.
     * 
     * @return true if the user's account is valid (i.e., non-expired).
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is locked or unlocked.
     * A locked user cannot be authenticated.
     * 
     * @return true if the user is not locked.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true; // Or logic for account locking
        // TODO Logic to check if the account is locked due to too many failed login
        // attempts
        // For example, you could add a field like `failedLoginAttempts` and lock the
        // account if it exceeds a threshold.
    }

    /**
     * Indicates whether the user's credentials (password) has expired.
     * Expired credentials prevent authentication.
     * 
     * @return true if the user's credentials are valid (i.e., non-expired).
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled or disabled.
     * A disabled user cannot be authenticated.
     * 
     * @return true if the user is enabled.
     */
    @Override
    public boolean isEnabled() {
        return true;
        // TODO Logic to check if the user's email has been verified
        // For example, you could add a field like `isEmailVerified` and return its
        // value.
    }
}