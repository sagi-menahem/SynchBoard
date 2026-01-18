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
 * Module-level flag to track if GSI script is being loaded.
 * Prevents multiple script injections.
 */
let gsiScriptLoading = false;
let gsiScriptLoaded = false;

/**
 * Checks if the Google Identity Services SDK is ready to use.
 */
const isGsiReady = (): boolean => {
  return Boolean(window.google?.accounts?.id);
};

/**
 * Polls for GSI SDK readiness with a timeout.
 */
const waitForGsi = (timeoutMs: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isGsiReady()) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (isGsiReady()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 50);

    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('GSI script load timeout'));
    }, timeoutMs);
  });
};

/**
 * Dynamically loads the Google Identity Services SDK.
 * Returns a promise that resolves when the SDK is ready.
 */
const loadGsiScript = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (gsiScriptLoaded && isGsiReady()) {
    return Promise.resolve();
  }

  // If script is already being loaded, wait for it
  if (gsiScriptLoading) {
    return waitForGsi(10000);
  }

  // Check if script tag already exists (e.g., added by another component)
  if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    gsiScriptLoading = true;
    return waitForGsi(10000)
      .then(() => {
        gsiScriptLoaded = true;
        gsiScriptLoading = false;
      })
      .catch((error) => {
        gsiScriptLoading = false;
        throw error;
      });
  }

  // Load the script
  gsiScriptLoading = true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      waitForGsi(5000)
        .then(() => {
          gsiScriptLoaded = true;
          gsiScriptLoading = false;
          logger.info('[GoogleOneTap] GSI script loaded successfully');
          resolve();
        })
        .catch((error) => {
          gsiScriptLoading = false;
          reject(error);
        });
    };

    script.onerror = () => {
      gsiScriptLoading = false;
      logger.error('[GoogleOneTap] Failed to load GSI script');
      reject(new Error('Failed to load GSI script'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Google One Tap authentication component that displays a floating prompt for quick Google sign-in.
 * Integrates with Google Identity Services SDK to provide seamless authentication without page redirects.
 * Automatically handles user creation, account merging, and JWT token management.
 *
 * Features:
 * - Lazy loads GSI script only when needed (improves landing page performance)
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

    // Initialize One Tap after loading the GSI script
    const initializeOneTap = () => {
      if (!isGsiReady()) {
        logger.debug('[GoogleOneTap] Google SDK not yet loaded');
        return false;
      }

      // Mark as initialized BEFORE calling SDK to prevent race conditions
      oneTapInitialized = true;

      try {
        // FedCM requires HTTPS - disable for local HTTP development
        const isSecureContext = window.location.protocol === 'https:';

        // Safe to use non-null assertion here - isGsiReady() already verified google.accounts.id exists
        const googleId = window.google!.accounts.id;

        googleId.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
          context: 'signin',
          use_fedcm_for_prompt: isSecureContext,
        });

        // When FedCM is enabled (HTTPS), we don't use the moment notification callback
        // as it triggers deprecation warnings and FedCM handles UI state internally.
        // On HTTP (local dev), FedCM is disabled and the legacy prompt is used.
        googleId.prompt();
        logger.info(
          `[GoogleOneTap] One Tap initialized (FedCM: ${isSecureContext ? 'enabled' : 'disabled'})`,
        );
        return true;
      } catch (error) {
        logger.error('[GoogleOneTap] Error initializing One Tap:', error);
        // Reset flag on error so it can be retried
        oneTapInitialized = false;
        return false;
      }
    };

    // Load GSI script dynamically (lazy load for performance)
    loadGsiScript()
      .then(() => {
        if (!initializeOneTap()) {
          // If SDK not ready after load, poll for it
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
              logger.warn('[GoogleOneTap] Google SDK failed to initialize within timeout');
            }
          }, 5000);
        }
      })
      .catch((error: unknown) => {
        logger.error('[GoogleOneTap] Failed to load GSI script:', error);
      });

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
