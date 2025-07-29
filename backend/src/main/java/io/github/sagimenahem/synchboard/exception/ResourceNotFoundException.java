// File: backend/src/main/java/io/github/sagimenahem/synchboard/exception/ResourceNotFoundException.java
package io.github.sagimenahem.synchboard.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
