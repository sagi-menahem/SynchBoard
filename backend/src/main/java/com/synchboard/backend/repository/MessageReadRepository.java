// File: backend/src/main/java/com/synchboard/backend/repository/MessageReadRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.MessageRead;
import com.synchboard.backend.entity.MessageReadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageReadRepository extends JpaRepository<MessageRead, MessageReadId> {
}