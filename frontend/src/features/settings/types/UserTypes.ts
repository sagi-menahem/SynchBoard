/**
 * User registration request interface containing all required information for account creation.
 */
export interface RegisterRequest {
  // Email address for account identification and communication
  email: string;
  // Password for account security (will be hashed server-side)
  password: string;
  // User's first name for profile identification
  firstName: string;
  // Optional last name for complete profile information
  lastName?: string;
  // Optional gender selection for profile customization
  gender?: 'male' | 'female';
  // Optional phone number for contact information
  phoneNumber?: string;
  // Optional date of birth in ISO string format
  dateOfBirth?: string;
}
/**
 * User login request interface for authentication credentials.
 */
export interface LoginRequest {
  // Email address for account identification
  email: string;
  // Password for authentication verification
  password: string;
}

/**
 * Authentication response interface containing JWT token for session management.
 */
export interface AuthResponse {
  // JWT token for authenticated API requests and session persistence
  token: string;
}

/**
 * Complete user profile interface containing personal information and preferences.
 */
export interface UserProfile {
  // Primary email address for account identification
  email: string;
  // User's first name for display and identification
  firstName: string;
  // User's last name, can be null if not provided
  lastName: string | null;
  // Gender selection for profile information
  gender: 'male' | 'female';
  // Optional phone number for contact purposes
  phoneNumber: string | null;
  // Optional date of birth in ISO string format
  dateOfBirth: string | null;
  // URL path to uploaded profile picture, null if using default
  profilePictureUrl: string | null;
  // Board background color preference in hex format or color name
  boardBackgroundSetting: string | null;
  // Preferred language code for internationalization
  preferredLanguage?: string | null;
}

/**
 * User profile update request interface for modifying personal information.
 */
export interface UpdateUserProfileRequest {
  // Updated first name (required field)
  firstName: string;
  // Optional updated last name
  lastName?: string;
  // Updated gender selection
  gender: 'male' | 'female';
  // Optional updated phone number
  phoneNumber?: string;
  // Optional updated date of birth in ISO string format
  dateOfBirth?: string;
}

/**
 * Password change request interface requiring current password verification.
 */
export interface ChangePasswordRequest {
  // Current password for verification before change
  currentPassword: string;
  // New password to replace the current one
  newPassword: string;
}

/**
 * User preferences interface for visual and behavioral customizations.
 */
export interface UserPreferences {
  // Board background color preference in hex format or color name
  boardBackgroundSetting?: string | null;
}

/**
 * Language preferences interface for internationalization settings.
 */
export interface LanguagePreferences {
  // Preferred language code for application localization
  preferredLanguage: 'en' | 'he';
}

/**
 * Dock anchor positions for floating toolbar placement.
 * Controls where the floating dock is positioned on the canvas.
 * Note: bottom-right is reserved for FloatingActions and not allowed for dock.
 */
export type DockAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-center'
  | 'right-center';

/**
 * Drawing tool preferences interface for canvas and drawing operations.
 */
export interface ToolPreferences {
  // Default drawing tool selection for new canvas sessions
  defaultTool: import('shared/types/CommonTypes').Tool;
  // Default stroke color for drawing tools in hex format
  defaultStrokeColor: string;
  // Default stroke width for drawing tools in pixels
  defaultStrokeWidth: number;
  // Dock anchor position for floating toolbar placement
  dockAnchor: DockAnchor;
  // Whether the floating dock is minimized/collapsed
  isDockMinimized: boolean;
}

/**
 * Theme preferences interface for application appearance settings.
 */
export interface ThemePreferences {
  // Theme selection for application-wide appearance mode
  theme: 'light' | 'dark';
}

/**
 * Email verification request interface for account activation.
 */
export interface VerifyEmailRequest {
  // Email address to verify
  email: string;
  // Verification code sent to email address
  verificationCode: string;
}

/**
 * Resend verification request interface for requesting new verification code.
 */
export interface ResendVerificationRequest {
  // Email address to send new verification code to
  email: string;
}

/**
 * Password reset request interface for initiating password recovery process.
 */
export interface ForgotPasswordRequest {
  // Email address for password reset instructions
  email: string;
}

/**
 * Password reset completion request interface for setting new password with reset code.
 */
export interface ResetPasswordRequest {
  // Email address of the account being reset
  email: string;
  // 6-digit reset code sent to email
  resetCode: string;
  // New password to set for the account
  newPassword: string;
}
