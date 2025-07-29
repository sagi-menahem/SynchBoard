// File: backend/src/main/java/io/github/sagimenahem/synchboard/exception/InvalidRequestException.java
package io.github.sagimenahem.synchboard.exception;

public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
