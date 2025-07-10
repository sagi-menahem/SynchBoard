// File: backend/src/main/java/com/synchboard/backend/repository/BoardObjectRepository.java

package com.synchboard.backend.repository;

import com.synchboard.backend.entity.BoardObject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {

    /**
     * Finds all board objects associated with a specific board ID.
     * Spring Data JPA will generate the query based on the method name.
     * The naming convention traverses the entities: find all by 'board' property's
     * 'boardGroupId' property.
     * 
     * @param boardGroupId The ID of the board.
     * @return A list of board objects.
     */
    List<BoardObject> findAllByBoard_BoardGroupId(Long boardGroupId);
}