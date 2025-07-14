// File: backend/src/main/java/com/synchboard/backend/repository/GroupBoardRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.GroupBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {
}