import { jwtDecode } from 'jwt-decode';
import logger from './logger';

interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

const TOKEN_KEY = 'token';

/**
 * Retrieves the JWT authentication token from localStorage.
 * Used throughout the application to access stored authentication state.
 * 
 * @returns {string | null} The stored JWT token or null if not found
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Stores a JWT authentication token in localStorage.
 * Called after successful login or token refresh to persist authentication state.
 * 
 * @param {string} token - The JWT token to store
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Removes the JWT authentication token from localStorage.
 * Used during logout or when authentication expires to clear stored credentials.
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Validates whether a JWT token is valid and not expired.
 * Checks token structure and expiration time against current timestamp.
 * 
 * @param {string | null} [token] - Optional token to validate, defaults to stored token
 * @returns {boolean} True if token is valid and not expired
 */
export const isTokenValid = (token?: string | null): boolean => {
  const tokenToCheck = token || getToken();

  if (!tokenToCheck) {
    return false;
  }

  try {
    const decoded = decodeToken(tokenToCheck);
    if (!decoded) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    logger.error('Error validating token:', error);
    return false;
  }
};

/**
 * Decodes a JWT token to extract its payload containing user information.
 * Safely handles malformed tokens and logs decode errors for debugging.
 * 
 * @param {string | null} [token] - Optional token to decode, defaults to stored token
 * @returns {JwtPayload | null} Decoded token payload or null if decode fails
 */
export const decodeToken = (token?: string | null): JwtPayload | null => {
  const tokenToDecode = token || getToken();

  if (!tokenToDecode) {
    return null;
  }

  try {
    return jwtDecode<JwtPayload>(tokenToDecode);
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extracts the expiration timestamp from a JWT token.
 * Used to determine when a token will expire for refresh scheduling.
 * 
 * @param {string | null} [token] - Optional token to examine, defaults to stored token
 * @returns {number | null} Unix timestamp of token expiration or null if unavailable
 */
export const getTokenExpiry = (token?: string | null): number | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp : null;
};

/**
 * Extracts the user email address from a JWT token's subject claim.
 * The subject (sub) claim typically contains the user's email in this application.
 * 
 * @param {string | null} [token] - Optional token to examine, defaults to stored token
 * @returns {string | null} User email address or null if unavailable
 */
export const getUserEmailFromToken = (token?: string | null): string | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.sub : null;
};

/**
 * Determines whether a JWT token should be refreshed based on its expiration time.
 * Returns true if the token expires within 5 minutes (300 seconds) but is still valid.
 * This allows proactive token refresh to prevent authentication interruptions.
 * 
 * @param {string | null} [token] - Optional token to check, defaults to stored token
 * @returns {boolean} True if token should be refreshed (expires soon but still valid)
 */
export const shouldRefreshToken = (token?: string | null): boolean => {
  const expiry = getTokenExpiry(token);

  if (!expiry) {
    return false;
  }

  const currentTime = Date.now() / 1000;
  const timeUntilExpiry = expiry - currentTime;

  // Refresh if expires within 5 minutes but is still valid
  return timeUntilExpiry < 300 && timeUntilExpiry > 0;
};
