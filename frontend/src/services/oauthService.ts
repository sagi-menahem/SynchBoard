import { API_BASE_URL } from 'constants';

export const oauthService = {
  redirectToGoogle: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  extractTokenFromCallback: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  },

  extractErrorFromCallback: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('message');
  },

  isOAuthCallback: (): boolean => {
    return window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/error';
  },
};