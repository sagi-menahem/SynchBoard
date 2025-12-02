package io.github.sagimenahem.synchboard.exception;

/**
 * Exception thrown when a client request is malformed, contains invalid data, or violates business
 * logic constraints. This exception indicates that the request cannot be processed due to
 * client-side errors or invalid input.
 *
 * <p>
 * This exception is mapped to HTTP 400 BAD REQUEST status in the global exception handler.
 * </p>
 *
 * <h3>Common Usage Scenarios:</h3>
 * <ul>
 * <li>Authentication operations - when verification codes are invalid, expired, or exceed maximum
 * attempts</li>
 * <li>Password management - when current password is incorrect, new password is same as current, or
 * reset codes are invalid/expired</li>
 * <li>File upload validation - when uploaded files are empty, have no filename, or violate
 * size/type constraints</li>
 * <li>Request validation - when required fields are missing or contain invalid formats</li>
 * <li>Business rule violations - when operations violate domain-specific rules or constraints</li>
 * <li>Input sanitization - when input data fails validation or security checks</li>
 * </ul>
 *
 * <h3>HTTP Response:</h3> When thrown, this exception results in an HTTP 400 BAD REQUEST response
 * with the exception message providing details about what made the request invalid.
 *
 * @author Sagi Menahem
 * @see io.github.sagimenahem.synchboard.exception.GlobalExceptionHandler#handleInvalidRequestException(InvalidRequestException)
 */
public class InvalidRequestException extends RuntimeException {

    /**
     * Constructs a new InvalidRequestException with the specified detail message. The detail
     * message should clearly explain what aspect of the request was invalid to help clients correct
     * their requests.
     *
     * @param message the detail message explaining why the request was invalid
     */
    public InvalidRequestException(String message) {
        super(message);
    }
}
