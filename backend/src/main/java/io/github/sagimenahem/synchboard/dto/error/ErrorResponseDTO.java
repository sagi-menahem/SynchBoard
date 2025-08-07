package io.github.sagimenahem.synchboard.dto.error;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponseDTO {

    private String message;
    private String errorCode;
    private Integer statusCode;
    private String details;
    private LocalDateTime timestamp;

    public ErrorResponseDTO(String message) {
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDTO(String message, String errorCode) {
        this.message = message;
        this.errorCode = errorCode;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDTO(String message, String errorCode, String details) {
        this.message = message;
        this.errorCode = errorCode;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDTO(int statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
