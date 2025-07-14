// File: backend/src/main/java/com/synchboard/backend/repository/UserRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.synchboard.backend.entity.User;

/**
 * Spring Data JPA repository for {@link User} entities.
 * The primary key is the user's email (String).
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    /**
     * Finds a user by their email address.
     *
     * @param email the email of the user to find.
     * @return an {@link Optional} containing the found user, or empty if not found.
     */
    Optional<User> findByEmail(String email);
}