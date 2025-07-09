// File: backend/src/main/java/com/synchboard/backend/repository/GroupBoardRepository.java

package com.synchboard.backend.repository;

import com.synchboard.backend.entity.GroupBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link GroupBoard} entity.
 * Provides CRUD operations where the GroupBoard's primary key is of type Long.
 */
@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {
    // Spring Data JPA will automatically implement basic CRUD methods.
    // We can add custom query methods here later if needed.
}