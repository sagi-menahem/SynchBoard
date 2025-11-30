package io.github.sagimenahem.synchboard.entity;

import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_CANVAS_CHAT_SPLIT_RATIO;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_LANGUAGE;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_STROKE_COLOR;
import static io.github.sagimenahem.synchboard.constants.CanvasConstants.DEFAULT_THEME;
import static io.github.sagimenahem.synchboard.constants.SecurityConstants.ROLE_USER;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing a user account in the SynchBoard application. Implements Spring
 * Security's UserDetails interface for authentication and authorization. Stores user profile
 * information, preferences, and OAuth2 provider details.
 * 
 * @author Sagi Menahem
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    /**
     * Enumeration of supported authentication providers. LOCAL for traditional email/password
     * authentication, GOOGLE for OAuth2 authentication via Google.
     */
    public enum AuthProvider {
        LOCAL, GOOGLE,
    }

    /** Primary key: unique email address serving as user identifier */
    @Id
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = true)
    private String gender;

    /** Authentication provider used for this user account */
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "board_background_setting")
    private String boardBackgroundSetting;

    @Column(name = "canvas_chat_split_ratio")
    @Builder.Default
    private Integer canvasChatSplitRatio = (int) DEFAULT_CANVAS_CHAT_SPLIT_RATIO;

    /** Whether the chat panel is open (visible) or collapsed */
    @Column(name = "is_chat_open")
    @Builder.Default
    private Boolean isChatOpen = true;

    /** Canvas zoom scale factor (0.1 to 5.0, where 1.0 = 100%) */
    @Column(name = "canvas_zoom_scale")
    @Builder.Default
    private Double canvasZoomScale = 1.0;

    @Column(name = "default_tool")
    @Builder.Default
    private String defaultTool = "brush";

    @Column(name = "default_stroke_color")
    @Builder.Default
    private String defaultStrokeColor = DEFAULT_STROKE_COLOR;

    @Column(name = "default_stroke_width")
    @Builder.Default
    private Integer defaultStrokeWidth = 3;

    /**
     * Dock anchor position for floating toolbar (bottom-center, bottom-left, bottom-right,
     * left-center, right-center)
     */
    @Column(name = "dock_anchor", length = 20)
    @Builder.Default
    private String dockAnchor = "bottom-center";

    /** Whether the floating dock is minimized/collapsed */
    @Column(name = "is_dock_minimized")
    @Builder.Default
    private Boolean isDockMinimized = false;

    @Column(name = "preferred_language")
    @Builder.Default
    private String preferredLanguage = DEFAULT_LANGUAGE;

    @Column(name = "theme_preference", length = 10, nullable = false)
    @Builder.Default
    private String themePreference = DEFAULT_THEME;

    @Column(name = "board_list_view_mode", length = 10)
    @Builder.Default
    private String boardListViewMode = "grid";

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "reset_code", length = 6)
    private String resetCode;

    @Column(name = "reset_expiry")
    private LocalDateTime resetExpiry;

    @PrePersist
    protected void onCreate() {
        this.creationDate = LocalDateTime.now();
    }

    public boolean isResetCodeExpired() {
        return this.resetExpiry == null || LocalDateTime.now().isAfter(this.resetExpiry);
    }

    public void clearResetCode() {
        this.resetCode = null;
        this.resetExpiry = null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(ROLE_USER));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
