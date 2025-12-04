import { useAuth } from 'features/auth/hooks';
import { useLanguageSync } from 'features/settings/hooks';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateDocumentDirection } from 'shared/lib/i18n';

/**
 * Return value from the useAppConfiguration hook.
 */
interface UseAppConfigurationResult {
  // Current height of the connection status banner in pixels
  bannerHeight: number;
  // Function to update the banner height when it changes
  handleBannerHeightChange: (height: number) => void;
  // Whether the app is currently processing OAuth authentication
  isOAuthProcessing: boolean;
  // Whether the app is still initializing authentication state
  isInitializing: boolean;
  // Fixed height of the toolbar in pixels
  toolbarHeight: number;
  // Render function for OAuth loading screen (returns null to show nothing)
  renderOAuthLoading: () => React.JSX.Element | null;
  // Render function for app initialization loading screen (returns null to show nothing)
  renderInitializingLoading: () => React.JSX.Element | null;
}

/**
 * Custom hook for managing application-wide configuration and initialization states.
 * Handles dynamic layout calculations, language synchronization, OAuth processing states,
 * and provides render functions for different loading screens. Essential for proper
 * app initialization and responsive layout management.
 *
 * @returns {UseAppConfigurationResult} Object containing layout dimensions, loading states, and render functions
 */
export function useAppConfiguration(): UseAppConfigurationResult {
  const [bannerHeight, setBannerHeight] = useState<number>(0);
  const { i18n } = useTranslation(['common', 'auth']);
  const { isInitializing } = useAuth();

  const toolbarHeight = 72;

  useLanguageSync();

  // Set CSS custom property for toolbar height to enable responsive layout calculations
  useEffect(() => {
    document.documentElement.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
  }, [toolbarHeight]);

  // Update document direction (LTR/RTL) when language changes
  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language]);

  const handleBannerHeightChange = (height: number) => {
    setBannerHeight(height);
  };

  // Check if OAuth authentication is currently being processed via session storage flag
  const isOAuthProcessing = sessionStorage.getItem('oauth_loading') === 'true';

  // Return null for loading states - prevents showing spinner before page skeleton
  const renderOAuthLoading = () => {
    return null;
  };

  const renderInitializingLoading = () => {
    return null;
  };

  return {
    bannerHeight,
    handleBannerHeightChange,
    isOAuthProcessing,
    isInitializing,
    toolbarHeight,
    renderOAuthLoading,
    renderInitializingLoading,
  };
}
