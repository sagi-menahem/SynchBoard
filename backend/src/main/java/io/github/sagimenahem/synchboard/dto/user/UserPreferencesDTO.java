// File: backend/src/main/java/io/github/sagimenahem/synchboard/dto/user/UserPreferencesDTO.java
package io.github.sagimenahem.synchboard.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {
    private String chatBackgroundSetting;
    private String fontSizeSetting;
}
