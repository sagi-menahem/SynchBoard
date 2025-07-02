// File: backend/src/main/java/com/synchboard/entity/FriendRequestId.java

package com.synchboard.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// Composite primary key for the FriendRequest entity.
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestId implements Serializable {
    private String requestingUserEmail; // [cite: 292]
    private String requestedUserEmail; // [cite: 293]

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendRequestId that = (FriendRequestId) o;
        return Objects.equals(requestingUserEmail, that.requestingUserEmail) &&
               Objects.equals(requestedUserEmail, that.requestedUserEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(requestingUserEmail, requestedUserEmail);
    }
}