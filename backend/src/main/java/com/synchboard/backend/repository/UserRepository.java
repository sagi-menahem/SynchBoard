// File: backend/src/main/java/com/synchboard/backend/repository/UserRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.User;

/**
 * Spring Data JPA repository for the {@link User} entity.
 * Provides CRUD operations where the User's primary key is a String (email).
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    // TODO: Add custom query methods if needed (e.g., findByFirstName).
}