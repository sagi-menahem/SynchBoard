// File: backend/src/main/java/com/synchboard/backend/dto/user/UserPreferencesDTO.java
package com.synchboard.backend.dto.user;

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