// File: backend/src/main/java/com/synchboard/repository/FriendRepository.java
package com.synchboard.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.synchboard.backend.entity.Friend;
import com.synchboard.backend.entity.FriendId;

@Repository
public interface FriendRepository extends JpaRepository<Friend, FriendId> {
}