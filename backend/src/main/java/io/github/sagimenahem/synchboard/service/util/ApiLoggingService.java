package io.github.sagimenahem.synchboard.service.util;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_COMPLETED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_FAILED;
import static io.github.sagimenahem.synchboard.constants.LoggingConstants.API_REQUEST_RECEIVED;

import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

/**
 * Utility service for consistent API request logging. Provides standardized logging for API
 * operations including timing, success/failure tracking, and performance monitoring across the
 * application.
 * 
 * @author Sagi Menahem
 */
@Slf4j
@Service
public class ApiLoggingService {

    /**
     * Executes an operation that returns a ResponseEntity with standardized logging. Logs request
     * start, completion time, and any errors that occur.
     * 
     * @param <T> The type of the response body
     * @param method The HTTP method (GET, POST, etc.)
     * @param path The API endpoint path
     * @param identifier User or request identifier for correlation
     * @param operation The operation to execute
     * @return The ResponseEntity returned by the operation
     * @throws Exception if the operation fails (re-throws original exception)
     */
    public <T> ResponseEntity<T> executeWithLogging(String method, String path, String identifier,
            Supplier<ResponseEntity<T>> operation) {
        log.info(API_REQUEST_RECEIVED, method, path, identifier);
        long startTime = System.currentTimeMillis();

        try {
            ResponseEntity<T> result = operation.get();
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, method, path, identifier, duration);
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, method, path, identifier,
                    e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }

    /**
     * Executes a void operation with standardized logging. Logs request start, completion time, and
     * any errors that occur.
     * 
     * @param method The HTTP method (GET, POST, etc.)
     * @param path The API endpoint path
     * @param identifier User or request identifier for correlation
     * @param operation The operation to execute
     * @throws Exception if the operation fails (re-throws original exception)
     */
    public void executeVoidWithLogging(String method, String path, String identifier,
            Runnable operation) {
        log.info(API_REQUEST_RECEIVED, method, path, identifier);
        long startTime = System.currentTimeMillis();

        try {
            operation.run();
            long duration = System.currentTimeMillis() - startTime;
            log.info(API_REQUEST_COMPLETED, method, path, identifier, duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error(API_REQUEST_FAILED, method, path, identifier,
                    e.getMessage() + " (Duration: " + duration + "ms)");
            throw e;
        }
    }
}
