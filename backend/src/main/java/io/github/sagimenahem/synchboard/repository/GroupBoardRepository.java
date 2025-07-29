// File: backend/src/main/java/io/github/sagimenahem/synchboard/repository/GroupBoardRepository.java
package io.github.sagimenahem.synchboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import io.github.sagimenahem.synchboard.config.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.GroupBoard;

@Repository
public interface GroupBoardRepository extends JpaRepository<GroupBoard, Long> {

    @Modifying
    @Query("UPDATE GroupBoard gb SET gb.createdByUser = NULL WHERE gb.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);
}
