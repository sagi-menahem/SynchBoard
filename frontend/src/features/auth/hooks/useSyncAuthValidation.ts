import { useCallback, useRef } from 'react';

import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import logger from 'shared/utils/logger';

interface TokenPayload {
  sub: string;
  exp?: number;
}

interface SyncAuthResult {
  isValid: boolean;
  userEmail: string | null;
  shouldClearToken: boolean;
  needsBackendValidation: boolean;
}

export const useSyncAuthValidation = () => {
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
      const warningTime = expiryTime - 5 * 60 * 1000; // 5 minutes before expiry
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
      // Clear any existing expiry warnings
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
        // Synchronously decode and validate JWT structure
        const decodedToken: TokenPayload = jwtDecode(token);
        const userEmail = decodedToken.sub;

        // Check if token is expired (synchronous check)
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

        // Schedule expiry warning if token has expiry time
        if (decodedToken.exp !== undefined) {
          const expiryTime = decodedToken.exp * 1000;
          scheduleExpiryWarning(expiryTime);
        }

        return {
          isValid: true,
          userEmail,
          shouldClearToken: false,
          needsBackendValidation: true, // Validate with backend in background
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
