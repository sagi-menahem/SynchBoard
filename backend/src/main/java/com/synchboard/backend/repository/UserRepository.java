// File: backend/src/main/java/com/synchboard/backend/repository/UserRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.User;

/**
 * Spring Data JPA repository for {@link User} entities.
 * The primary key is the user's email (String).
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
}