// File: backend/src/main/java/com/synchboard/entity/FriendId.java

package com.synchboard.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// Composite primary key for the Friend entity.
@NoArgsConstructor
@AllArgsConstructor
public class FriendId implements Serializable {
    private String userEmail1; // [cite: 300]
    private String userEmail2; // [cite: 301]

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendId friendId = (FriendId) o;
        // The order does not matter for friendship, so we check both combinations.
        return (Objects.equals(userEmail1, friendId.userEmail1) && Objects.equals(userEmail2, friendId.userEmail2)) ||
               (Objects.equals(userEmail1, friendId.userEmail2) && Objects.equals(userEmail2, friendId.userEmail1));
    }

    @Override
    public int hashCode() {
        // A consistent hash code where order doesn't matter.
        return Objects.hash(userEmail1) + Objects.hash(userEmail2);
    }
}