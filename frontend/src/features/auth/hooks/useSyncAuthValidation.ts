import { jwtDecode } from 'jwt-decode';
import { useCallback, useRef } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

interface TokenPayload {
  // Subject (user identifier) from JWT token
  sub: string;
  // Optional expiration timestamp in seconds since epoch
  exp?: number;
}

interface SyncAuthResult {
  // Whether the token passed synchronous validation checks
  isValid: boolean;
  // Email address extracted from token, null if invalid
  userEmail: string | null;
  // Whether the token should be removed from storage
  shouldClearToken: boolean;
  // Whether additional backend validation is required
  needsBackendValidation: boolean;
}

/**
 * Hook for synchronous JWT token validation without backend API calls.
 * Performs client-side token decoding, expiration checking, and session warning
 * scheduling while determining if additional server-side validation is needed.
 *
 * @returns Object containing synchronous validation methods and token management functions
 */
export const useSyncAuthValidation = () => {
  const { t } = useTranslation(['auth']);
  const expiryWarningTimeoutRef = useRef<number | null>(null);

  const clearExpiryWarning = useCallback(() => {
    if (expiryWarningTimeoutRef.current !== null) {
      clearTimeout(expiryWarningTimeoutRef.current);
      expiryWarningTimeoutRef.current = null;
    }
  }, []);

  // Memoized to prevent unnecessary timeout rescheduling on re-renders
  const scheduleExpiryWarning = useCallback(
    (expiryTime: number) => {
      // Schedule warning 5 minutes (300,000ms) before token expires
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

  const validateTokenSync = useCallback(
    (token: string | null): SyncAuthResult => {
      clearExpiryWarning();

      if (!token) {
        return {
          isValid: false,
          userEmail: null,
          shouldClearToken: false,
          needsBackendValidation: false,
        };
      }

      try {
        const decodedToken: TokenPayload = jwtDecode(token);
        const userEmail = decodedToken.sub;

        const isExpired =
          decodedToken.exp !== undefined ? decodedToken.exp * 1000 < Date.now() : false;

        if (isExpired) {
          logger.warn('[useSyncAuthValidation] Token is expired');
          return {
            isValid: false,
            userEmail: null,
            shouldClearToken: true,
            needsBackendValidation: false,
          };
        }

        if (decodedToken.exp !== undefined) {
          const expiryTime = decodedToken.exp * 1000;
          scheduleExpiryWarning(expiryTime);
        }

        // Token is valid but requires backend verification
        return {
          isValid: true,
          userEmail,
          shouldClearToken: false,
          needsBackendValidation: true,
        };
      } catch (error) {
        logger.error('[useSyncAuthValidation] Failed to decode JWT token', error);
        return {
          isValid: false,
          userEmail: null,
          shouldClearToken: true,
          needsBackendValidation: false,
        };
      }
    },
    [clearExpiryWarning, scheduleExpiryWarning],
  );

  const clearTokenFromStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }, []);

  return {
    validateTokenSync,
    clearExpiryWarning,
    clearTokenFromStorage,
  };
};
