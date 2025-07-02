// File: backend/src/main/java/com/synchboard/repository/ActionHistoryRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.ActionHistory;

@Repository
public interface ActionHistoryRepository extends JpaRepository<ActionHistory, Long> {
}