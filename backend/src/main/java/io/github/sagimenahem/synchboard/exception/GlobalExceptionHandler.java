package io.github.sagimenahem.synchboard.exception;

import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import io.github.sagimenahem.synchboard.constants.MessageConstants;
import io.github.sagimenahem.synchboard.dto.error.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponseDTO> handleBadCredentialsException(
                        BadCredentialsException ex) {
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.UNAUTHORIZED.value(),
                                                MessageConstants.AUTH_BAD_CREDENTIALS);
                log.warn("Authentication failed: {}", ex.getMessage());
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleResourceNotFoundException(
                        ResourceNotFoundException ex) {
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.NOT_FOUND.value(), ex.getMessage());
                log.warn("Resource not found: {}", ex.getMessage());
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(ResourceConflictException.class)
        public ResponseEntity<ErrorResponseDTO> handleResourceConflictException(
                        ResourceConflictException ex) {
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.CONFLICT.value(), ex.getMessage());
                log.warn("Resource conflict: {}", ex.getMessage());
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(InvalidRequestException.class)
        public ResponseEntity<ErrorResponseDTO> handleInvalidRequestException(
                        InvalidRequestException ex) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                HttpStatus.BAD_REQUEST.value(), ex.getMessage());
                log.warn("Invalid request: {}", ex.getMessage());
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponseDTO> handleValidationExceptions(
                        MethodArgumentNotValidException ex) {
                String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                                .map(error -> error.getDefaultMessage())
                                .collect(Collectors.joining(", "));
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.BAD_REQUEST.value(), errorMessage);
                log.warn("Validation error: {}", errorMessage);
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponseDTO> handleAccessDeniedException(
                        AccessDeniedException ex) {
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.FORBIDDEN.value(), ex.getMessage());
                log.warn("Access denied: {}", ex.getMessage());
                return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleAllExceptions(Exception ex) {
                ErrorResponseDTO errorResponse =
                                new ErrorResponseDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                                MessageConstants.UNEXPECTED_ERROR);
                log.error("An unexpected error occurred", ex);
                return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}
