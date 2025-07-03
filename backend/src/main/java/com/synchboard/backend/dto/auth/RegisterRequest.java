// File: backend/src/main/java/com/synchboard/backend/dto/auth/RegisterRequest.java

package com.synchboard.backend.dto.auth;

import lombok.Data;

@Data // Lombok annotation to generate getters, setters, toString, etc.
public class RegisterRequest {

    // These fields must match the JSON object sent from the frontend client.
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;

}
