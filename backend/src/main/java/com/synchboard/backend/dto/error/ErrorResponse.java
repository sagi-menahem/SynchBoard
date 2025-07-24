// File: backend/src/main/java/com/synchboard/backend/dto/error/ErrorResponse.java
package com.synchboard.backend.dto.error;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {

    private int statusCode;
    private String message;
    private LocalDateTime timestamp;

}
