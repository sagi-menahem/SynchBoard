package io.github.sagimenahem.synchboard.exception;

/**
 * Exception thrown when a requested resource cannot be found in the system. This exception
 * indicates that an operation failed because the target resource (such as a user, board, or other
 * entity) does not exist or cannot be accessed.
 *
 * <p>
 * This exception is mapped to HTTP 404 NOT FOUND status in the global exception handler.
 * </p>
 *
 * <h3>Common Usage Scenarios:</h3>
 * <ul>
 * <li>User authentication - when login attempts are made with non-existent email addresses</li>
 * <li>User operations - when attempting to access user profiles, update preferences, or manage
 * accounts for non-existent users</li>
 * <li>Board access - when trying to access boards that don't exist or are not accessible to the
 * current user</li>
 * <li>Email verification - when verification codes are submitted for non-existent pending
 * registrations</li>
 * <li>Password reset - when password reset requests are made for non-existent user accounts</li>
 * <li>Account management - when attempting to delete or modify user accounts that don't exist</li>
 * </ul>
 *
 * <h3>HTTP Response:</h3> When thrown, this exception results in an HTTP 404 NOT FOUND response
 * with the exception message as the error description.
 *
 * @author Sagi Menahem
 * @see io.github.sagimenahem.synchboard.exception.GlobalExceptionHandler#handleResourceNotFoundException(ResourceNotFoundException)
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructs a new ResourceNotFoundException with the specified detail message. The detail
     * message should clearly indicate which resource was not found to help with debugging and user
     * feedback.
     *
     * @param message the detail message explaining what resource was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
