import React from 'react';

import { ConnectionStatusBanner } from 'features/board/ui';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'shared/ui/errorBoundary';

import { AppRoutes } from 'shared/ui/routing';
import { ToasterConfig } from 'shared/ui/components/ToasterConfig';
import { useAppConfiguration } from 'shared/hooks/useAppConfiguration';


function App() {
  const {
    bannerHeight,
    handleBannerHeightChange,
    isOAuthProcessing,
    isInitializing,
    toolbarHeight,
    renderOAuthLoading,
    renderInitializingLoading,
  } = useAppConfiguration();
  
  if (isOAuthProcessing) {
    return renderOAuthLoading();
  }
  
  if (isInitializing) {
    return renderInitializingLoading();
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConnectionStatusBanner onHeightChange={handleBannerHeightChange} />
        <div style={{ 
          paddingTop: `${bannerHeight}px`,
          '--banner-height': `${bannerHeight}px`,
          '--toolbar-height': `${toolbarHeight}px`,
          '--content-offset': `${bannerHeight + toolbarHeight + 16}px`,
          transition: 'padding-top var(--transition-duration-slow) ease-in-out',
          minHeight: '100vh',
        } as React.CSSProperties}>
          <ToasterConfig />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;