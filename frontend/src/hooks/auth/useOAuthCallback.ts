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
  
  // Simple loading state - true if we're specifically on the callback route with OAuth params
  const [isProcessing, setIsProcessing] = useState(() => {
    return window.location.pathname === '/auth/callback' && 
           (new URLSearchParams(window.location.search).has('token') || 
            new URLSearchParams(window.location.search).has('code'));
  });

  useEffect(() => {
    // Only process OAuth if we're specifically on the callback route (not error route)
    if (window.location.pathname !== '/auth/callback') {
      return;
    }

    // Must have OAuth parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('token') && !urlParams.has('code') && !urlParams.has('message')) {
      return;
    }

    const handleOAuthCallback = async () => {
      // Set global loading state
      sessionStorage.setItem('oauth_loading', 'true');

      try {
        // Check for error first
        const error = oauthService.extractErrorFromCallback();
        if (error) {
          toast.error(error);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          return;
        }

        // Extract token from callback
        const token = oauthService.extractTokenFromCallback();
        if (!token) {
          toast.error(t('oauth.error.noToken', 'Authentication failed. Please try again.'));
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.AUTH, { replace: true });
          setIsProcessing(false);
          sessionStorage.removeItem('oauth_loading');
          return;
        }

        // Login with the received token
        authLogin(token);
        
        // Small delay to allow state to update, then navigate
        setTimeout(() => {
          // Only show toast if we haven't already
          if (!sessionStorage.getItem('oauth_success_shown')) {
            toast.success(t('oauth.success', 'Successfully logged in with Google!'));
            sessionStorage.setItem('oauth_success_shown', 'true');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate(APP_ROUTES.BOARD_LIST, { replace: true });
          
          // Keep loading screen visible for longer to prevent flash
          setTimeout(() => {
            setIsProcessing(false);
            // Clear global loading state
            sessionStorage.removeItem('oauth_loading');
            // Clean up after navigation
            setTimeout(() => {
              sessionStorage.removeItem('oauth_success_shown');
            }, 500);
          }, 1200); // Keep loading screen for 1200ms after navigation
        }, 100);

      } catch (error) {
        toast.error(t('oauth.error.processing', 'Authentication failed. Please try again.'));
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate(APP_ROUTES.AUTH, { replace: true });
        setIsProcessing(false);
        sessionStorage.removeItem('oauth_loading');
      }
    };

    handleOAuthCallback();
  }, []); // Empty dependency array - only run once on mount

  return { isProcessing };
};