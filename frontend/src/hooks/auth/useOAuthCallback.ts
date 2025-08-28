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

    const shouldProcess = isCallback && hasParams;

    if (shouldProcess) {
      sessionStorage.setItem('oauth_loading', 'true');
    }

    return shouldProcess;
  });

  useEffect(() => {
    const processedKey = 'oauth_callback_processed';
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

        authLogin(token);

        if (!sessionStorage.getItem('oauth_success_shown')) {
          toast.success(t('oauth.success', 'Successfully logged in with Google!'));
          sessionStorage.setItem('oauth_success_shown', 'true');
        }
        sessionStorage.removeItem('oauth_loading');
        setIsProcessing(false);

        window.history.replaceState({}, document.title, '/auth');
        navigate(APP_ROUTES.BOARD_LIST, { replace: true });

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