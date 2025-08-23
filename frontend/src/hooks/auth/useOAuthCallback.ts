import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { APP_ROUTES } from 'constants';
import { useAuth } from 'hooks/auth';
import { oauthService } from 'services/oauthService';
import logger from 'utils/logger';

export const useOAuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  // Generate unique ID for this hook instance
  const hookId = Math.random().toString(36).substr(2, 9);
  
  // Simple loading state - true if we're specifically on the callback route with OAuth params
  const [isProcessing, setIsProcessing] = useState(() => {
    const shouldProcess = window.location.pathname === '/auth/callback' && 
           (new URLSearchParams(window.location.search).has('token') || 
            new URLSearchParams(window.location.search).has('code'));
    logger.info(`[OAuth-${hookId}] Hook initialized, shouldProcess: ${shouldProcess}, pathname: ${window.location.pathname}`);
    return shouldProcess;
  });

  useEffect(() => {
    logger.info(`[OAuth-${hookId}] useEffect triggered, pathname: ${window.location.pathname}`);
    
    // Only process OAuth if we're specifically on the callback route (not error route)
    if (window.location.pathname !== '/auth/callback') {
      logger.info(`[OAuth-${hookId}] Not on callback route, skipping`);
      return;
    }

    // Must have OAuth parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('token') && !urlParams.has('code') && !urlParams.has('message')) {
      logger.info(`[OAuth-${hookId}] No OAuth parameters found, skipping`);
      return;
    }

    const handleOAuthCallback = async () => {
      logger.info(`[OAuth-${hookId}] Processing OAuth callback`);

      try {
        // Check for error first
        const error = oauthService.extractErrorFromCallback();
        if (error) {
          logger.error('[OAuth] Authentication failed:', error);
          toast.error(error);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          return;
        }

        // Extract token from callback
        const token = oauthService.extractTokenFromCallback();
        if (!token) {
          logger.error('[OAuth] No token received from OAuth callback');
          toast.error(t('oauth.error.noToken', 'Authentication failed. Please try again.'));
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          return;
        }

        // Login with the received token
        logger.info(`[OAuth-${hookId}] Attempting login with token`);
        authLogin(token);
        
        // Small delay to allow state to update, then navigate
        setTimeout(() => {
          logger.info(`[OAuth-${hookId}] Authentication successful, navigating to board list`);
          // Only show toast if we haven't already
          if (!sessionStorage.getItem('oauth_success_shown')) {
            toast.success(t('oauth.success', 'Successfully logged in with Google!'));
            sessionStorage.setItem('oauth_success_shown', 'true');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.BOARD_LIST, { replace: true });
          setIsProcessing(false);
          // Clean up after navigation
          setTimeout(() => {
            sessionStorage.removeItem('oauth_success_shown');
          }, 1000);
        }, 100);

      } catch (error) {
        logger.error('[OAuth] Error processing OAuth callback:', error);
        toast.error(t('oauth.error.processing', 'Authentication failed. Please try again.'));
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(APP_ROUTES.AUTH, { replace: true });
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, []); // Empty dependency array - only run once on mount

  return { isProcessing };
};