import { APP_ROUTES } from 'constants';

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
    
    logger.info('[useOAuthCallback] Initial state', {
      isCallback,
      hasParams,
      pathname: window.location.pathname,
      search: window.location.search,
      isProcessing: isCallback && hasParams,
    });
    
    return isCallback && hasParams;
  });

  useEffect(() => {
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

    const handleOAuthCallback = async () => {
      logger.info('[useOAuthCallback] Starting OAuth callback processing');
      sessionStorage.setItem('oauth_loading', 'true');

      try {
        const error = oauthService.extractErrorFromCallback();
        if (error) {
          logger.error('[useOAuthCallback] OAuth error extracted from callback:', error);
          toast.error(error);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
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
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          return;
        }

        logger.info('[useOAuthCallback] Calling authLogin with extracted token');
        authLogin(token);
        
        setTimeout(() => {
          logger.info('[useOAuthCallback] Post-login navigation starting');
          
          if (!sessionStorage.getItem('oauth_success_shown')) {
            toast.success(t('oauth.success', 'Successfully logged in with Google!'));
            sessionStorage.setItem('oauth_success_shown', 'true');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          
          logger.info('[useOAuthCallback] Navigating to board list');
          navigate(APP_ROUTES.BOARD_LIST, { replace: true });
          
          setTimeout(() => {
            logger.debug('[useOAuthCallback] Clearing processing state');
            setIsProcessing(false);
            sessionStorage.removeItem('oauth_loading');
            setTimeout(() => {
              sessionStorage.removeItem('oauth_success_shown');
            }, 500);
          }, 1200);
        }, 100);

      } catch (error) {
        logger.error('[useOAuthCallback] Error processing OAuth callback', error);
        toast.error(t('oauth.error.processing', 'Authentication failed. Please try again.'));
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(APP_ROUTES.AUTH, { replace: true });
        setIsProcessing(false);
        sessionStorage.removeItem('oauth_loading');
      }
    };

    handleOAuthCallback();
  }, [authLogin, navigate, t]);

  return { isProcessing };
};