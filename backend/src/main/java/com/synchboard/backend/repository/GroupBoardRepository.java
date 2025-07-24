// File: backend/src/main/java/com/synchboard/backend/repository/GroupBoardRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.synchboard.backend.entity.GroupBoard;

@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {

    @Modifying
    @Query("UPDATE GroupBoard gb SET gb.createdByUser = NULL WHERE gb.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param("userEmail") String userEmail);
}
