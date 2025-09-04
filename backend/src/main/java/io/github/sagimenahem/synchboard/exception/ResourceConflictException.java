package io.github.sagimenahem.synchboard.exception;

/**
 * Exception thrown when an operation cannot be completed due to a conflict with the current state
 * of a resource. This exception indicates that the request is valid but conflicts with existing
 * data or business rules that prevent the operation from proceeding.
 * 
 * <p>
 * This exception is mapped to HTTP 409 CONFLICT status in the global exception handler.
 * </p>
 * 
 * <h3>Common Usage Scenarios:</h3>
 * <ul>
 * <li>User registration - when attempting to register with an email address that already exists in
 * the system</li>
 * <li>Resource creation - when trying to create entities that would violate uniqueness
 * constraints</li>
 * <li>State conflicts - when operations conflict with the current state of system resources</li>
 * <li>Duplicate prevention - when business logic prevents duplicate entries or operations</li>
 * <li>Concurrent operations - when multiple users attempt conflicting operations
 * simultaneously</li>
 * </ul>
 * 
 * <h3>HTTP Response:</h3> When thrown, this exception results in an HTTP 409 CONFLICT response with
 * the exception message describing the specific conflict that occurred.
 * 
 * @author Sagi Menahem
 * @see io.github.sagimenahem.synchboard.exception.GlobalExceptionHandler#handleResourceConflictException(ResourceConflictException)
 */
public class ResourceConflictException extends RuntimeException {

    /**
     * Constructs a new ResourceConflictException with the specified detail message. The detail
     * message should clearly describe the nature of the conflict to help with debugging and provide
     * meaningful feedback to users.
     * 
     * @param message the detail message explaining the specific conflict that occurred
     */
    public ResourceConflictException(String message) {
        super(message);
    }
}
