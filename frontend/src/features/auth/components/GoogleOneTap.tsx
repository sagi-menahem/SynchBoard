import { useCallback, useEffect, useRef, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { LOCAL_STORAGE_KEYS } from 'shared/constants/AppConstants';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useFeatureConfig } from 'shared/context/FeatureConfigContext';
import logger from 'shared/utils/logger';

import { useAuth } from '../hooks';
import * as authService from '../services/authService';
import type { CredentialResponse } from '../types/google.d';

/**
 * Module-level flag to track if Google One Tap has been initialized.
 * This persists across React Strict Mode double-mounts, preventing the SDK
 * from being initialized twice which would trigger FedCM cool-down periods.
 */
let oneTapInitialized = false;

/**
 * Google One Tap authentication component that displays a floating prompt for quick Google sign-in.
 * Integrates with Google Identity Services SDK to provide seamless authentication without page redirects.
 * Automatically handles user creation, account merging, and JWT token management.
 *
 * Features:
 * - Shows One Tap prompt only on auth page when user is not logged in
 * - Respects Google login feature flag from backend configuration
 * - Handles SDK loading state and errors gracefully
 * - Provides visual feedback during authentication process
 * - Strict Mode safe: initializes exactly once per session
 */
const GoogleOneTap: React.FC = () => {
  const { t } = useTranslation(['auth']);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, login: authLogin } = useAuth();
  const featureConfig = useFeatureConfig();
  const [isProcessing, setIsProcessing] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Handles the credential response from Google One Tap.
   * Sends the ID token to backend for verification and user processing.
   */
  const handleCredentialResponse = useCallback(
    async (response: CredentialResponse) => {
      if (isProcessing) {
        return;
      }

      setIsProcessing(true);
      logger.info('[GoogleOneTap] Received credential, processing...');

      try {
        const toastId = toast.loading(t('oauth.loading'));

        const authResponse = await authService.googleOneTap(response.credential);

        toast.dismiss(toastId);
        toast.success(t('oauth.success'));

        authLogin(authResponse.token);
        logger.info('[GoogleOneTap] Authentication successful, navigating to boards');

        navigate(APP_ROUTES.BOARD_LIST, { replace: true });
      } catch (error) {
        logger.error('[GoogleOneTap] Authentication failed:', error);
        toast.error(t('oauth.error.processing'));
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, t, authLogin, navigate],
  );

  useEffect(() => {
    // Skip if already initialized (Strict Mode safe)
    if (oneTapInitialized) {
      logger.debug('[GoogleOneTap] Already initialized, skipping');
      return;
    }

    // Only show One Tap on the main auth page, not on callback or error routes
    // This prevents the prompt from appearing during OAuth redirect processing
    if (location.pathname !== APP_ROUTES.AUTH) {
      logger.debug('[GoogleOneTap] Not on main auth page, skipping One Tap');
      return;
    }

    // Skip if already authenticated - check both context token AND localStorage
    // localStorage check is synchronous and handles race conditions where
    // context hasn't updated yet after OAuth callback navigation
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    if (token || storedToken) {
      logger.debug('[GoogleOneTap] User already authenticated, skipping One Tap');
      return;
    }

    // Skip if Google login is not enabled
    if (!featureConfig.googleLoginEnabled) {
      logger.debug('[GoogleOneTap] Google login not enabled, skipping One Tap');
      return;
    }

    // Get client ID from environment
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      logger.debug('[GoogleOneTap] VITE_GOOGLE_CLIENT_ID not configured, skipping One Tap');
      return;
    }

    // Wait for Google SDK to load
    const initializeOneTap = () => {
      if (!window.google?.accounts?.id) {
        logger.debug('[GoogleOneTap] Google SDK not yet loaded, waiting...');
        return false;
      }

      // Mark as initialized BEFORE calling SDK to prevent race conditions
      oneTapInitialized = true;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
          context: 'signin',
          use_fedcm_for_prompt: true,
        });

        // With FedCM enabled, we don't use the moment notification callback
        // as it triggers deprecation warnings and FedCM handles UI state internally
        window.google.accounts.id.prompt();
        logger.info('[GoogleOneTap] One Tap initialized and prompt displayed');
        return true;
      } catch (error) {
        logger.error('[GoogleOneTap] Error initializing One Tap:', error);
        // Reset flag on error so it can be retried
        oneTapInitialized = false;
        return false;
      }
    };

    // Try to initialize immediately
    if (!initializeOneTap()) {
      // If SDK not loaded, poll for it
      pollIntervalRef.current = setInterval(() => {
        if (initializeOneTap()) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      }, 100);

      // Clean up polling after 5 seconds
      timeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        if (!oneTapInitialized) {
          logger.warn('[GoogleOneTap] Google SDK failed to load within timeout');
        }
      }, 5000);
    }

    // Cleanup only the polling timers, NOT the Google SDK
    // We intentionally do NOT call google.accounts.id.cancel() on cleanup.
    // React Strict Mode double-mounts components in development, and calling
    // cancel() triggers a FedCM cool-down period. Let Google handle cleanup naturally.
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [token, featureConfig.googleLoginEnabled, location.pathname, handleCredentialResponse]);

  // This component doesn't render any visible UI
  // The One Tap prompt is rendered by Google SDK
  return null;
};

export default GoogleOneTap;
