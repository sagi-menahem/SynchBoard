// File: backend/src/main/java/com/synchboard/backend/dto/auth/LoginRequest.java
package com.synchboard.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import static com.synchboard.backend.config.ApplicationConstants.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotEmpty(message = ERROR_EMAIL_CANT_BE_EMPTY)
    @Email(message = ERROR_EMAIL_SHOULD_BE_VALID)
    private String email;

    @NotEmpty(message = ERROR_PASSWORD_CANT_BE_EMPTY)
    private String password;
}