package io.github.sagimenahem.synchboard.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user registration that is pending email verification. This entity stores
 * temporary user data until the email verification process is completed, after which the data is
 * moved to the User entity.
 *
 * @author Sagi Menahem
 */
@Entity
@Table(name = "pending_registrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRegistration {

    /**
     * Email address (serves as primary key)
     */
    @Id
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * User's first name
     */
    @Column(name = "first_name", nullable = false)
    private String firstName;

    /**
     * User's last name (optional)
     */
    @Column(name = "last_name")
    private String lastName;

    /**
     * Hashed password for the user account
     */
    @Column(name = "hashed_password", nullable = false)
    private String hashedPassword;

    /**
     * User's gender (optional)
     */
    @Column(nullable = true)
    private String gender;

    /**
     * User's phone number (optional)
     */
    @Column(name = "phone_number")
    private String phoneNumber;

    /**
     * User's date of birth (optional)
     */
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    /**
     * 6-digit verification code sent to the user's email
     */
    @Column(name = "verification_code", nullable = false, length = 6)
    private String verificationCode;

    /**
     * When the verification code expires
     */
    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    /**
     * Number of verification attempts made (max 3)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    /**
     * Timestamp when the pending registration was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * JPA lifecycle callback to set the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Checks if the verification code has expired.
     *
     * @return true if the current time is after the expiry time
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }

    /**
     * Checks if the maximum number of verification attempts has been reached.
     *
     * @return true if 3 or more attempts have been made
     */
    public boolean isMaxAttemptsReached() {
        return this.attempts >= 3;
    }

    /**
     * Increments the number of verification attempts. This method should be called each time a
     * verification is attempted.
     */
    public void incrementAttempts() {
        this.attempts++;
    }
}
