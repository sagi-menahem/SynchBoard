// File: backend/src/main/java/com/synchboard/backend/exception/ResourceConflictException.java
package com.synchboard.backend.exception;

public class ResourceConflictException extends RuntimeException {

    public ResourceConflictException(String message) {
        super(message);
    }
}