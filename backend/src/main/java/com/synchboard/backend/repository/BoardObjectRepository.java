// File: backend/src/main/java/com/synchboard/backend/repository/BoardObjectRepository.java
package com.synchboard.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import com.synchboard.backend.config.constants.ApiConstants;
import com.synchboard.backend.entity.BoardObject;

@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {

    List<BoardObject> findAllByBoard_BoardGroupIdAndIsActiveTrue(Long boardGroupId);

    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    @Modifying
    @Query("UPDATE BoardObject bo SET bo.createdByUser = NULL WHERE bo.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    @Modifying
    @Query("UPDATE BoardObject bo SET bo.lastEditedByUser = NULL WHERE bo.lastEditedByUser.email = :userEmail")
    void nullifyLastEditedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);
}
