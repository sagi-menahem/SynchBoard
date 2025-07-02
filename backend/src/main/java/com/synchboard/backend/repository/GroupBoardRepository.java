// File: backend/src/main/java/com/synchboard/repository/GroupBoardRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.GroupBoard;

@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> { // Entity is GroupBoard, PK type is Long
}