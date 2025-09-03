import React from 'react';

import { ConnectionStatusBanner } from 'features/board/ui';
import { BrowserRouter } from 'react-router-dom';
import { useAppConfiguration } from 'shared/hooks/useAppConfiguration';
import { ToasterConfig } from 'shared/ui/components/ToasterConfig';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { AppRoutes } from 'shared/ui/routing';


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
        <div 
          className="app-content"
          style={{ 
            '--banner-height': `${bannerHeight}px`,
            '--toolbar-height': `${toolbarHeight}px`,
            '--content-offset': `${bannerHeight + toolbarHeight + 16}px`,
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