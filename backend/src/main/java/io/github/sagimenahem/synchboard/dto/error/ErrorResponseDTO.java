package io.github.sagimenahem.synchboard.dto.error;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for standardized error responses. Provides consistent error information
 * structure for API responses including error messages, codes, status codes, and timestamps.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponseDTO {

    /** Human-readable error message */
    private String message;

    /** Application-specific error code for programmatic handling */
    private String errorCode;

    /** HTTP status code associated with the error */
    private Integer statusCode;

    /** Additional technical details about the error */
    private String details;

    /** Timestamp when the error occurred */
    private LocalDateTime timestamp;

    /**
     * Constructor for basic error response with message only. Automatically sets timestamp to
     * current time.
     */
    public ErrorResponseDTO(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for error response with message and error code. Automatically sets timestamp to
     * current time.
     */
    public ErrorResponseDTO(String message, String errorCode) {
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for detailed error response with message, code, and details. Automatically sets
     * timestamp to current time.
     */
    public ErrorResponseDTO(String message, String errorCode, String details) {
        this.message = message;
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for error response with HTTP status code and message. Automatically sets
     * timestamp to current time.
     */
    public ErrorResponseDTO(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
