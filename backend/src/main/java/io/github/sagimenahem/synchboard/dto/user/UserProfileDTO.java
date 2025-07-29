// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/user/UserProfileDTO.java
package io.github.sagimenahem.synchboard.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profilePictureUrl;
    private String chatBackgroundSetting;
    private String fontSizeSetting;
}
