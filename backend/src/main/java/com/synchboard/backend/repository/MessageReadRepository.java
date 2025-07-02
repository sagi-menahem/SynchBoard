// File: backend/src/main/java/com/synchboard/repository/MessageReadRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.MessageRead;
import com.synchboard.backend.entity.MessageReadId;

@Repository
public interface MessageReadRepository extends JpaRepository<MessageRead, MessageReadId> {
}