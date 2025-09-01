package io.github.sagimenahem.synchboard.service.util;

import static io.github.sagimenahem.synchboard.constants.LoggingConstants.*;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.function.Supplier;

@Slf4j
@Service
public class ApiLoggingService {

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