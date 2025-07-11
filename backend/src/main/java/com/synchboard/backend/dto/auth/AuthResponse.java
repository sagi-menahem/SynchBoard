// File: backend/src/main/java/com/synchboard/backend/dto/auth/AuthResponse.java
package com.synchboard.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for sending back an authentication response.
 * Contains the JWT token for the authenticated user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * The JWT access token.
     */
    private String token;
}