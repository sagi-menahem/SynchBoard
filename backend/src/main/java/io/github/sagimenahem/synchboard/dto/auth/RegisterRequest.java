// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/auth/RegisterRequest.java
package io.github.sagimenahem.synchboard.dto.auth;

import lombok.Data;

@Data
public class RegisterRequest {

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;
}
