
import { useAuth } from 'features/auth/hooks';
import { useLanguageSync } from 'features/settings/hooks';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateDocumentDirection } from 'shared/lib/i18n';
import { PageLoader, PageTransition } from 'shared/ui';

interface UseAppConfigurationResult {
  bannerHeight: number;
  handleBannerHeightChange: (height: number) => void;
  isOAuthProcessing: boolean;
  isInitializing: boolean;
  toolbarHeight: number;
  renderOAuthLoading: () => React.JSX.Element;
  renderInitializingLoading: () => React.JSX.Element;
}

export function useAppConfiguration(): UseAppConfigurationResult {
  const [bannerHeight, setBannerHeight] = useState<number>(0);
  const { i18n, t } = useTranslation(['common', 'auth']);
  const { isInitializing } = useAuth();

  const toolbarHeight = 72;

  useLanguageSync();

  useEffect(() => {
    document.documentElement.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
  }, [toolbarHeight]);

  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language]);

  const handleBannerHeightChange = (height: number) => {
    setBannerHeight(height);
  };

  const isOAuthProcessing = sessionStorage.getItem('oauth_loading') === 'true';

  const renderOAuthLoading = () => {
    return (
      <PageTransition>
        <PageLoader message={t('auth:signingInMessage')} />
      </PageTransition>
    );
  };

  const renderInitializingLoading = () => {
    return (
      <PageTransition>
        <PageLoader message={t('common:loading')} />
      </PageTransition>
    );
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
