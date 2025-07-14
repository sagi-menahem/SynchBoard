// File: backend/src/main/java/com/synchboard/backend/dto/auth/RegisterRequest.java
package com.synchboard.backend.dto.auth;

import lombok.Data;

@Data
public class RegisterRequest {

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;
}