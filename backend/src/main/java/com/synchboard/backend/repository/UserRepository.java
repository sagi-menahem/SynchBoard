// File: backend/src/main/java/com/synchboard/repository/UserRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> { // Entity is User, Primary Key type is String (email)
}