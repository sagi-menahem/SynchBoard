package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {

    /**
     * Find pending registration by email
     */
    Optional<PendingRegistration> findByEmail(String email);

    /**
     * Find pending registration by email and verification code
     */
    Optional<PendingRegistration> findByEmailAndVerificationCode(String email, String verificationCode);

    /**
     * Check if email exists in pending registrations
     */
    boolean existsByEmail(String email);

    /**
     * Delete expired pending registrations
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.expiryTime < :now")
    int deleteExpiredRegistrations(@Param("now") LocalDateTime now);

    /**
     * Delete pending registrations that have exceeded max attempts
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.attempts >= 3")
    int deleteMaxAttemptsExceeded();

    /**
     * Count pending registrations for today (for monitoring)
     */
    @Query("SELECT COUNT(p) FROM PendingRegistration p WHERE p.createdAt >= :todayStart")
    long countTodayRegistrations(@Param("todayStart") LocalDateTime todayStart);

    /**
     * Find all expired registrations (for cleanup job)
     */
    @Query("SELECT p FROM PendingRegistration p WHERE p.expiryTime < :now")
    java.util.List<PendingRegistration> findExpiredRegistrations(@Param("now") LocalDateTime now);
}