// File: backend/src/main/java/com/synchboard/backend/dto/auth/LoginRequest.java
package com.synchboard.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.synchboard.backend.config.ApplicationConstants.*;

/**
 * DTO for user login requests.
 * Contains credentials for a user to log in.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    /**
     * The user's email address. Must be a valid email format and not empty.
     */
    @NotEmpty(message = ERROR_EMAIL_CANT_BE_EMPTY)
    @Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
    private String email;

    /**
     * The user's password. Cannot be empty.
     */
    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String password;
}