// File: backend/src/main/java/com/synchboard/repository/MessageRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
}