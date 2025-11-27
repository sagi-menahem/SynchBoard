import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import logger from 'shared/utils/logger';

import { extractErrorFromCallback, extractTokenFromCallback } from '../services/authService';

import { useAuth } from '.';

/**
 * Hook for processing OAuth authentication callbacks from external providers.
 * Handles token extraction, error handling, session management, and navigation
 * after OAuth flow completion. Prevents duplicate processing and manages loading states.
 *
 * @returns Object containing processing state for OAuth callback handling
 */
export const useOAuthCallback = () => {
  const { t } = useTranslation(['auth', 'common']);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Expensive initialization: OAuth callback detection with URL parsing to prevent unnecessary renders
  const [isProcessing, setIsProcessing] = useState(() => {
    const isCallback = window.location.pathname === '/auth/callback';
    const hasParams =
      new URLSearchParams(window.location.search).has('token') ||
      new URLSearchParams(window.location.search).has('code');

    const shouldProcess = isCallback && hasParams;

    if (shouldProcess) {
      // Mark OAuth flow as in progress to prevent UI flickering
      sessionStorage.setItem('oauth_loading', 'true');
    }

    return shouldProcess;
  });

  useEffect(() => {
    // Early exit if not on callback path
    if (window.location.pathname !== '/auth/callback') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const hasToken = urlParams.has('token');
    const hasCode = urlParams.has('code');
    const hasMessage = urlParams.has('message');

    // No OAuth parameters present
    if (!hasToken && !hasCode && !hasMessage) {
      return;
    }

    // Use a unique key based on the actual token/code to prevent re-processing the SAME callback
    // but allow NEW OAuth attempts to proceed
    const currentToken = urlParams.get('token') ?? urlParams.get('code') ?? '';
    const processedKey = `oauth_processed_${currentToken.substring(0, 20)}`;

    // Prevent duplicate processing of the same callback (e.g., React StrictMode double-mount)
    if (sessionStorage.getItem(processedKey) === 'true') {
      logger.info('[useOAuthCallback] Skipping duplicate processing for same callback');
      return;
    }

    // Mark this specific callback as being processed
    sessionStorage.setItem(processedKey, 'true');

    const cleanupSessionStorage = () => {
      sessionStorage.removeItem('oauth_loading');
      sessionStorage.removeItem(processedKey);
      sessionStorage.removeItem('oauth_success_shown');
    };

    const handleOAuthCallback = async () => {
      try {
        const error = extractErrorFromCallback();
        if (error !== null && error !== '') {
          logger.error('[useOAuthCallback] OAuth error extracted from callback:', error);
          toast.error(t('auth:oauth.error.processing'));
          cleanupSessionStorage();
          setIsProcessing(false);
          void navigate(APP_ROUTES.AUTH, { replace: true });
          return;
        }

        const token = extractTokenFromCallback();

        if (token === null || token === '') {
          logger.error('[useOAuthCallback] No token found in OAuth callback');
          toast.error(t('auth:oauth.error.noToken'));
          cleanupSessionStorage();
          setIsProcessing(false);
          void navigate(APP_ROUTES.AUTH, { replace: true });
          return;
        }

        // Store the token FIRST
        authLogin(token);
        logger.info('[useOAuthCallback] Token stored successfully');

        // Show success toast only once
        if (sessionStorage.getItem('oauth_success_shown') === null) {
          toast.success(t('auth:oauth.success'));
          sessionStorage.setItem('oauth_success_shown', 'true');
        }

        setIsProcessing(false);
        sessionStorage.removeItem('oauth_loading');

        // Navigate to board list - let React Router handle the URL update
        void navigate(APP_ROUTES.BOARD_LIST, { replace: true });

        // Clean up session storage after navigation completes
        setTimeout(() => {
          sessionStorage.removeItem('oauth_success_shown');
          sessionStorage.removeItem(processedKey);
        }, 1000);
      } catch (error) {
        logger.error('[useOAuthCallback] Error processing OAuth callback', error);
        toast.error(t('auth:oauth.error.processing'));
        cleanupSessionStorage();
        setIsProcessing(false);
        void navigate(APP_ROUTES.AUTH, { replace: true });
      }
    };

    void handleOAuthCallback();
  }, [authLogin, navigate, t]);

  return { isProcessing };
};
