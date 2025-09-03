package io.github.sagimenahem.synchboard.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import io.github.sagimenahem.synchboard.entity.PendingRegistration;

@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {

    Optional<PendingRegistration> findByEmail(String email);

    Optional<PendingRegistration> findByEmailAndVerificationCode(String email,
            String verificationCode);

    boolean existsByEmail(String email);

    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.expiryTime < :now")
    int deleteExpiredRegistrations(@Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM PendingRegistration p WHERE p.attempts >= 3")
    int deleteMaxAttemptsExceeded();

    @Query("SELECT COUNT(p) FROM PendingRegistration p WHERE p.createdAt >= :todayStart")
    long countTodayRegistrations(@Param("todayStart") LocalDateTime todayStart);

    @Query("SELECT p FROM PendingRegistration p WHERE p.expiryTime < :now")
    java.util.List<PendingRegistration> findExpiredRegistrations(@Param("now") LocalDateTime now);
}
