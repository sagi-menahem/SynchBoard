package io.github.sagimenahem.synchboard.repository;

import io.github.sagimenahem.synchboard.constants.ApiConstants;
import io.github.sagimenahem.synchboard.entity.BoardObject;
import io.github.sagimenahem.synchboard.entity.GroupBoard;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BoardObjectRepository extends JpaRepository<BoardObject, Long> {
    List<BoardObject> findAllByBoard_BoardGroupIdAndIsActiveTrue(Long boardGroupId);

    @Query(
        "SELECT bo FROM BoardObject bo LEFT JOIN FETCH bo.createdByUser LEFT JOIN FETCH bo.lastEditedByUser WHERE bo.board.boardGroupId = :boardGroupId AND bo.isActive = true"
    )
    List<BoardObject> findActiveByBoardWithUsers(@Param("boardGroupId") Long boardGroupId);

    Optional<BoardObject> findByInstanceIdAndBoardAndIsActive(String instanceId, GroupBoard board, boolean isActive);

    @Transactional
    void deleteAllByBoard_BoardGroupId(Long boardGroupId);

    @Modifying
    @Query("UPDATE BoardObject bo SET bo.createdByUser = NULL WHERE bo.createdByUser.email = :userEmail")
    void nullifyCreatedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);

    @Modifying
    @Query("UPDATE BoardObject bo SET bo.lastEditedByUser = NULL WHERE bo.lastEditedByUser.email = :userEmail")
    void nullifyLastEditedByUser(@Param(ApiConstants.PARAM_USER_EMAIL) String userEmail);
}
