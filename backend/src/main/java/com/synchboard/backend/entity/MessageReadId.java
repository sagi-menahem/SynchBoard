// File: backend/src/main/java/com/synchboard/entity/MessageReadId.java

package com.synchboard.backend.entity;

import java.io.Serializable;
import java.util.Objects;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

// Composite primary key for the MessageRead entity.
@NoArgsConstructor
@AllArgsConstructor
public class MessageReadId implements Serializable {
    private Long messageId; // Corresponds to message_id foreign key. [cite: 285]
    private String userEmail; // Corresponds to user_email foreign key. [cite: 286]

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageReadId that = (MessageReadId) o;
        return Objects.equals(messageId, that.messageId) && Objects.equals(userEmail, that.userEmail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(messageId, userEmail);
    }
}