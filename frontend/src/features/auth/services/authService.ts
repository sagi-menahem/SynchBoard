import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from 'features/settings/types/UserTypes';
import { API_BASE_URL, API_ENDPOINTS } from 'shared/constants/ApiConstants';
import apiClient from 'shared/lib/apiClient';

/**
 * Registers a new user account with the backend and handles both email verification and direct login flows.
 * When email verification is enabled, returns a message to check email. When disabled, returns auth token for immediate login.
 * 
 * @param userData - User registration data including email, password, and profile fields
 * @returns Either AuthResponse with token (when email verification disabled) or string message (when enabled)
 */
export const register = async (userData: RegisterRequest): Promise<AuthResponse | string> => {
  const response = await apiClient.post<AuthResponse | string>(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Authenticates user with email and password credentials, returning JWT token for session management.
 * Validates credentials against backend and provides authentication token for subsequent API calls.
 * 
 * @param credentials - User login credentials containing email and password
 * @returns Authentication response containing JWT token and user information
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

/**
 * Completes email verification process using 6-digit code sent to user's email address.
 * Validates verification code and activates user account, returning authentication token for immediate login.
 * 
 * @param data - Email verification data containing email address and 6-digit verification code
 * @returns Authentication response with JWT token for newly verified and activated account
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.VERIFY_EMAIL, data);
  return response.data;
};

/**
 * Requests a new verification code to be sent to user's email address for accounts pending verification.
 * Useful when initial verification code expires or is lost, subject to rate limiting for security.
 * 
 * @param data - Request data containing email address to resend verification code to
 * @returns Success message confirming new verification code has been sent
 */
export const resendVerificationCode = async (data: ResendVerificationRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.RESEND_VERIFICATION, data);
  return response.data;
};

/**
 * Initiates password reset process by sending reset instructions to user's registered email address.
 * Generates secure reset token and sends email with reset link for account password recovery.
 *
 * @param data - Password reset request containing email address for account recovery
 * @returns Success message confirming password reset instructions have been sent
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.FORGOT_PASSWORD, data);
  return response.data;
};

/**
 * Completes password reset process using the reset code sent to user's email.
 * Validates the reset code and updates the user's password with the new one.
 *
 * @param data - Reset password request containing email, reset code, and new password
 * @returns Success message confirming password has been reset
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<string> => {
  const response = await apiClient.post<string>(API_ENDPOINTS.RESET_PASSWORD, data);
  return response.data;
};

/**
 * Redirects user to Google OAuth2 authorization endpoint for third-party authentication.
 * Initiates OAuth flow by navigating to backend-configured Google authorization URL.
 */
export const redirectToGoogle = (): void => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};

/**
 * Extracts JWT token from OAuth callback URL query parameters after successful third-party authentication.
 * Parses 'token' query parameter containing authentication token from OAuth provider redirect.
 * 
 * @returns JWT token string if present in URL parameters, null if not found or OAuth flow failed
 */
export const extractTokenFromCallback = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

/**
 * Extracts error message from OAuth callback URL when third-party authentication fails.
 * Parses 'message' query parameter containing error description from failed OAuth provider redirect.
 * 
 * @returns Error message string if present in URL parameters, null if no error occurred
 */
export const extractErrorFromCallback = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('message');
};

/**
 * Determines if current page URL represents an OAuth callback route from third-party authentication provider.
 * Checks pathname against known OAuth success and error callback routes to identify post-authentication state.
 * 
 * @returns True if current page is OAuth callback route, false for regular authentication pages
 */
export const isOAuthCallback = (): boolean => {
  return (
    window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/error'
  );
};
