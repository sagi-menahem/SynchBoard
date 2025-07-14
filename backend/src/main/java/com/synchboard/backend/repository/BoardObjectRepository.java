// File: backend/src/main/java/com/synchboard/backend/repository/BoardObjectRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.BoardObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {

    List<BoardObject> findAllByBoard_BoardGroupIdAndIsActiveTrue(Long boardGroupId);
}