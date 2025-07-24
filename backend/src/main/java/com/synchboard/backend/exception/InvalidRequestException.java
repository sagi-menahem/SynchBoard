// File: backend/src/main/java/com/synchboard/backend/exception/InvalidRequestException.java
package com.synchboard.backend.exception;

public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}