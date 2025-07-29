// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/auth/AuthResponse.java
package io.github.sagimenahem.synchboard.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
}
