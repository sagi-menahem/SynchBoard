// File: backend/src/main/java/com/synchboard/backend/exception/ResourceNotFoundException.java
package com.synchboard.backend.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
