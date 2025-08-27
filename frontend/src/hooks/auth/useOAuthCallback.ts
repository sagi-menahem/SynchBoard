import { APP_ROUTES, LOCAL_STORAGE_KEYS } from 'constants';

import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';
import { oauthService } from 'services/oauthService';


export const useOAuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(() => {
    const isCallback = window.location.pathname === '/auth/callback';
    const hasParams = new URLSearchParams(window.location.search).has('token') || 
                     new URLSearchParams(window.location.search).has('code');
    
    const shouldProcess = isCallback && hasParams;
    
    // Set oauth_loading immediately if we're on callback with params
    // This ensures App.tsx shows loading from the very start
    if (shouldProcess) {
      sessionStorage.setItem('oauth_loading', 'true');
    }
    
    logger.info('[useOAuthCallback] Initial state', {
      isCallback,
      hasParams,
      pathname: window.location.pathname,
      search: window.location.search,
      isProcessing: shouldProcess,
      oauthLoadingSet: shouldProcess,
    });
    
    return shouldProcess;
  });

  useEffect(() => {
    // Use sessionStorage to prevent duplicate processing across component remounts
    const processedKey = 'oauth_callback_processed';
    if (sessionStorage.getItem(processedKey) === 'true') {
      logger.debug('[useOAuthCallback] Already processed, skipping');
      return;
    }

    logger.info('[useOAuthCallback] useEffect running', {
      pathname: window.location.pathname,
      search: window.location.search,
      hasToken: new URLSearchParams(window.location.search).has('token'),
      hasCode: new URLSearchParams(window.location.search).has('code'),
      hasMessage: new URLSearchParams(window.location.search).has('message'),
    });
    
    if (window.location.pathname !== '/auth/callback') {
      logger.debug('[useOAuthCallback] Not on callback route, skipping OAuth processing');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('token') && !urlParams.has('code') && !urlParams.has('message')) {
      logger.debug('[useOAuthCallback] No OAuth parameters found, skipping processing');
      return;
    }

    // Mark as processed immediately
    sessionStorage.setItem(processedKey, 'true');

    const handleOAuthCallback = async () => {
      logger.info('[useOAuthCallback] Starting OAuth callback processing');

      try {
        const error = oauthService.extractErrorFromCallback();
        if (error) {
          logger.error('[useOAuthCallback] OAuth error extracted from callback:', error);
          toast.error(error);
          window.history.replaceState({}, document.title, '/auth');
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          sessionStorage.removeItem('oauth_callback_processed');
          return;
        }

        const token = oauthService.extractTokenFromCallback();
        logger.info('[useOAuthCallback] Token extraction result', {
          hasToken: !!token,
          tokenLength: token?.length,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        });
        
        if (!token) {
          logger.error('[useOAuthCallback] No token found in OAuth callback');
          toast.error(t('oauth.error.noToken', 'Authentication failed. Please try again.'));
          window.history.replaceState({}, document.title, '/auth');
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          sessionStorage.removeItem('oauth_callback_processed');
          return;
        }

        logger.info('[useOAuthCallback] Calling authLogin with extracted token');
        authLogin(token);
        
        // Show success toast
        if (!sessionStorage.getItem('oauth_success_shown')) {
          toast.success(t('oauth.success', 'Successfully logged in with Google!'));
          sessionStorage.setItem('oauth_success_shown', 'true');
        }
        
        // Clear OAuth loading state immediately to allow navigation
        logger.info('[useOAuthCallback] Clearing OAuth loading state and navigating to board list');
        sessionStorage.removeItem('oauth_loading');
        setIsProcessing(false);
        
        // Navigate to board list
        window.history.replaceState({}, document.title, '/auth');
        navigate(APP_ROUTES.BOARD_LIST, { replace: true });
        
        // Clean up other OAuth state after a brief delay
        setTimeout(() => {
          sessionStorage.removeItem('oauth_success_shown');
          sessionStorage.removeItem('oauth_callback_processed');
        }, 1000);

      } catch (error) {
        logger.error('[useOAuthCallback] Error processing OAuth callback', error);
        toast.error(t('oauth.error.processing', 'Authentication failed. Please try again.'));
        window.history.replaceState({}, document.title, '/auth');
        navigate(APP_ROUTES.AUTH, { replace: true });
        setIsProcessing(false);
        sessionStorage.removeItem('oauth_loading');
        sessionStorage.removeItem('oauth_callback_processed');
      }
    };

    handleOAuthCallback();
  }, [authLogin, navigate, t]);

  return { isProcessing };
};