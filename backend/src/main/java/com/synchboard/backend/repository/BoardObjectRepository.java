// File: backend/src/main/java/com/synchboard/backend/repository/BoardObjectRepository.java
package com.synchboard.backend.repository;

import com.synchboard.backend.entity.BoardObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link BoardObject} entities.
 */
@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {

    /**
     * Finds all BoardObject entities associated with a specific group board ID.
     *
     * @param boardGroupId the ID of the group board.
     * @return a list of board objects for the given board.
     */
    List<BoardObject> findAllByBoard_BoardGroupId(Long boardGroupId);
}