// File: backend/src/main/java/io/github/sagimenahem/synchboard/repository/MessageReadRepository.java
package io.github.sagimenahem.synchboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.github.sagimenahem.synchboard.entity.MessageRead;
import io.github.sagimenahem.synchboard.entity.MessageReadId;

@Repository
public interface MessageReadRepository extends JpaRepository<MessageRead, MessageReadId> {
}