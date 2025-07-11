// File: backend/src/main/java/com/synchboard/backend/dto/auth/RegisterRequest.java
package com.synchboard.backend.dto.auth;

import lombok.Data;

/**
 * DTO for user registration requests.
 * Contains the necessary information to create a new user account.
 */
@Data
public class RegisterRequest {

    /**
     * The new user's email address.
     */
    private String email;

    /**
     * The new user's password.
     */
    private String password;

    /**
     * The new user's first name.
     */
    private String firstName;

    /**
     * The new user's last name.
     */
    private String lastName;

    /**
     * The new user's phone number.
     */
    private String phoneNumber;
}