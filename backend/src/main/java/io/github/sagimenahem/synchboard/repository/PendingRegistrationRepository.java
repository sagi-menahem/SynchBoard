package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.PendingRegistration;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data JPA repository interface for PendingRegistration entity operations. Manages temporary
 * registration records for email verification workflow, providing CRUD operations and cleanup
 * functionality for user account creation.
 *
 * The PendingRegistration entity stores temporary user information during the email verification
 * process, including verification codes, attempt tracking, and expiration management. This
 * repository supports secure user registration with email validation, rate limiting, and automated
 * cleanup of expired records.
 *
 * @author Sagi Menahem
 */
@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {
    /**
     * Finds a pending registration record by email address. Used to retrieve existing registration
     * attempts and check verification status during the user registration process.
     *
     * @param email the email address of the pending registration
     * @return an Optional containing the registration record, or empty if none found
     */
    Optional<PendingRegistration> findByEmail(String email);

    /**
     * Finds a pending registration record by email and verification code combination. Used during
     * email verification to validate the provided verification code against the stored registration
     * data.
     *
     * @param email the email address of the pending registration
     * @param verificationCode the verification code provided by the user
     * @return an Optional containing the matching registration record, or empty if invalid
     */
    Optional<PendingRegistration> findByEmailAndVerificationCode(String email, String verificationCode);

    /**
     * Checks if a pending registration exists for a specific email address. Used to prevent
     * duplicate registration attempts and enforce registration policies.
     *
     * @param email the email address to check
     * @return true if a pending registration exists for the email, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Deletes all expired pending registration records. This cleanup operation removes registration
     * records that have passed their expiration time to maintain database hygiene and security.
     *
     * @param now the current timestamp to compare against expiry times
     * @return the number of expired registrations that were deleted
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.expiryTime < :now")
    int deleteExpiredRegistrations(@Param("now") LocalDateTime now);

    /**
     * Deletes all pending registration records that have exceeded the maximum verification
     * attempts. This security measure prevents brute force attacks on verification codes by
     * removing registrations after too many failed attempts.
     *
     * @return the number of registrations deleted due to exceeded attempts
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.attempts >= 3")
    int deleteMaxAttemptsExceeded();

    /**
     * Counts the number of registration attempts made today. Used for rate limiting and monitoring
     * registration activity to prevent spam and abuse of the registration system.
     *
     * @param todayStart the timestamp representing the start of the current day
     * @return the count of registration attempts made since the start of today
     */
    @Query("SELECT COUNT(p) FROM PendingRegistration p WHERE p.createdAt >= :todayStart")
    long countTodayRegistrations(@Param("todayStart") LocalDateTime todayStart);

    /**
     * Finds all pending registration records that have expired. Used for cleanup operations and
     * monitoring of expired verification attempts. This method returns the records rather than
     * deleting them, allowing for logging or additional processing before removal.
     *
     * @param now the current timestamp to compare against expiry times
     * @return list of expired registration records
     */
    @Query("SELECT p FROM PendingRegistration p WHERE p.expiryTime < :now")
    java.util.List<PendingRegistration> findExpiredRegistrations(@Param("now") LocalDateTime now);
}
