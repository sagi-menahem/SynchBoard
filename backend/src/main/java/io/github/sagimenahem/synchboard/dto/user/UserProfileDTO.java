package io.github.sagimenahem.synchboard.dto.user;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object representing a user's profile information. Contains personal details,
 * contact information, and user preferences for display and management of user accounts.
 * 
 * @author Sagi Menahem
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    /** User's email address */
    private String email;

    /** User's first name */
    private String firstName;

    /** User's last name */
    private String lastName;

    /** User's gender (male/female) */
    private String gender;

    /** User's phone number */
    private String phoneNumber;

    /** User's date of birth */
    private LocalDate dateOfBirth;

    /** URL to the user's profile picture */
    private String profilePictureUrl;

    /** User's board background preference setting */
    private String boardBackgroundSetting;

    /** User's preferred language (en/he) */
    private String preferredLanguage;
}
