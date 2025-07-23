// File: backend/src/main/java/com/synchboard/backend/entity/MessageReadId.java
package com.synchboard.backend.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MessageReadId implements Serializable {
    private Long message;
    private String userEmail;
}