import { getUserProfile } from 'features/settings/services/userService';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

interface AuthValidationResult {
  // Whether the authentication token is valid and user is authenticated
  isValid: boolean;
  // Email address from the decoded token, null if invalid
  userEmail: string | null;
  // Whether the token should be removed from storage due to invalidity
  shouldClearToken: boolean;
}

/**
 * Hook for validating JWT authentication tokens and managing session expiry warnings.
 * Handles token decoding, expiration checking, user validation, and proactive session
 * management with expiry notifications to maintain secure authentication state.
 *
 * @returns Object containing token validation methods and storage management functions
 */
export const useAuthValidation = () => {
  const { t } = useTranslation(['auth']);
  const expiryWarningTimeoutRef = useRef<number | null>(null);

  const clearExpiryWarning = useCallback(() => {
    if (expiryWarningTimeoutRef.current !== null) {
      clearTimeout(expiryWarningTimeoutRef.current);
      expiryWarningTimeoutRef.current = null;
    }
  }, []);

  const scheduleExpiryWarning = useCallback(
    (expiryTime: number) => {
      // Schedule warning 5 minutes before token expires
      const warningTime = expiryTime - 5 * 60 * 1000;
      const timeUntilWarning = warningTime - Date.now();

      if (timeUntilWarning > 0) {
        expiryWarningTimeoutRef.current = window.setTimeout(() => {
          toast(t('auth:sessionExpiry.warning'), {
            duration: 10000,
            id: 'session-expiry-warning',
            icon: '⚠️',
          });
        }, timeUntilWarning);
      }
    },
    [t],
  );

  const validateToken = useCallback(
    async (token: string | null): Promise<AuthValidationResult> => {
      clearExpiryWarning();

      if (!token) {
        return {
          isValid: false,
          userEmail: null,
          shouldClearToken: false,
        };
      }

      try {
        const decodedToken: { sub: string; exp?: number } = jwtDecode(token);
        const userEmail = decodedToken.sub;

        const isExpired =
          decodedToken.exp !== undefined ? decodedToken.exp * 1000 < Date.now() : false;

        if (isExpired) {
          logger.warn('[useAuthValidation] Token is expired');
          return {
            isValid: false,
            userEmail: null,
            shouldClearToken: true,
          };
        }

        try {
          // Verify token validity by attempting to fetch user profile
          await getUserProfile();

          if (decodedToken.exp !== undefined) {
            const expiryTime = decodedToken.exp * 1000;
            scheduleExpiryWarning(expiryTime);
          }

          return {
            isValid: true,
            userEmail,
            shouldClearToken: false,
          };
        } catch (error) {
          logger.warn('[useAuthValidation] User validation failed - token may be invalid', error);
          return {
            isValid: false,
            userEmail: null,
            shouldClearToken: true,
          };
        }
      } catch (error) {
        logger.error('[useAuthValidation] Failed to decode JWT token', error);
        return {
          isValid: false,
          userEmail: null,
          shouldClearToken: true,
        };
      }
    },
    [clearExpiryWarning, scheduleExpiryWarning],
  );

  const clearTokenFromStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }, []);

  return {
    validateToken,
    clearExpiryWarning,
    clearTokenFromStorage,
  };
};
