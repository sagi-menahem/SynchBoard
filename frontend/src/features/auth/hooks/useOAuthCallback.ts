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
    const processedKey = 'oauth_callback_processed';
    // Prevent duplicate processing of the same callback
    if (sessionStorage.getItem(processedKey) === 'true') {
      return;
    }

    if (window.location.pathname !== '/auth/callback') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('token') && !urlParams.has('code') && !urlParams.has('message')) {
      return;
    }

    sessionStorage.setItem(processedKey, 'true');

    const handleOAuthCallback = async () => {
      try {
        const error = extractErrorFromCallback();
        if (error !== null && error !== '') {
          logger.error('[useOAuthCallback] OAuth error extracted from callback:', error);
          toast.error(t('auth:oauth.error.processing'));
          void window.history.replaceState({}, document.title, '/auth');
          void navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          sessionStorage.removeItem('oauth_callback_processed');
          return;
        }

        const token = extractTokenFromCallback();

        if (token === null || token === '') {
          logger.error('[useOAuthCallback] No token found in OAuth callback');
          toast.error(t('auth:oauth.error.noToken'));
          void window.history.replaceState({}, document.title, '/auth');
          void navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          sessionStorage.removeItem('oauth_callback_processed');
          return;
        }

        authLogin(token!);

        if (sessionStorage.getItem('oauth_success_shown') === null) {
          toast.success(t('auth:oauth.success'));
          sessionStorage.setItem('oauth_success_shown', 'true');
        }
        sessionStorage.removeItem('oauth_loading');
        setIsProcessing(false);

        void window.history.replaceState({}, document.title, '/auth');
        void navigate(APP_ROUTES.BOARD_LIST, { replace: true });

        // Clean up session storage after navigation completes - 1 second delay ensures navigation is complete
        setTimeout(() => {
          sessionStorage.removeItem('oauth_success_shown');
          sessionStorage.removeItem('oauth_callback_processed');
        }, 1000);
      } catch (error) {
        logger.error('[useOAuthCallback] Error processing OAuth callback', error);
        toast.error(t('auth:oauth.error.processing'));
        void window.history.replaceState({}, document.title, '/auth');
        void navigate(APP_ROUTES.AUTH, { replace: true });
        setIsProcessing(false);
        sessionStorage.removeItem('oauth_loading');
        sessionStorage.removeItem('oauth_callback_processed');
      }
    };

    void handleOAuthCallback();
  }, [authLogin, navigate, t]);

  return { isProcessing };
};
