// File: backend/src/main/java/com/synchboard/repository/BoardObjectRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.BoardObject;

@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {
}