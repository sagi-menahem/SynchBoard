// File: backend/src/main/java/com/synchboard/repository/FriendRequestRepository.java
package com.synchboard.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.FriendRequest;
import com.synchboard.backend.entity.FriendRequestId;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, FriendRequestId> {
}