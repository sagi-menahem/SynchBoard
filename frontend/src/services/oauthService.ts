import { API_BASE_URL } from 'constants';

export const oauthService = {
  /**
   * Redirect to Google OAuth login
   */
  redirectToGoogle: () => {
    // Redirect to Spring Boot OAuth2 endpoint for Google
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  /**
   * Extract token from OAuth callback URL
   */
  extractTokenFromCallback: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  },

  /**
   * Extract error message from OAuth callback URL
   */
  extractErrorFromCallback: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('message');
  },

  /**
   * Check if current URL is OAuth callback
   */
  isOAuthCallback: (): boolean => {
    return window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/error';
  },
};