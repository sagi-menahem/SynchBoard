package io.github.sagimenahem.synchboard.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing user preferences and settings. Contains configuration options
 * that affect the user's experience across the application, particularly board display settings.
 * 
 * @author Sagi Menahem
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {

    /** User's preferred board background setting */
    private String boardBackgroundSetting;

    /** User's board list view mode preference (grid/list) */
    private String boardListViewMode;
}
