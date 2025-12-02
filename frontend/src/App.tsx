import { ConnectionStatusBanner } from 'features/board/ui';
import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { useAppConfiguration } from 'shared/hooks/useAppConfiguration';
import { ToasterConfig } from 'shared/ui/components/ToasterConfig';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { AppRoutes } from 'shared/ui/routing';

/**
 * Main application component that serves as the root of the React component tree.
 * Manages application-wide routing, error boundaries, layout calculations, and
 * loading states for OAuth and initialization processes.
 */
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

  // Handle OAuth redirect processing - prevents app from rendering during OAuth flow
  if (isOAuthProcessing) {
    return renderOAuthLoading();
  }

  // Handle app initialization - prevents app from rendering until providers are ready
  if (isInitializing) {
    return renderInitializingLoading();
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConnectionStatusBanner onHeightChange={handleBannerHeightChange} />
        <div
          className="app-content"
          style={
            {
              // CSS custom properties for dynamic layout calculations
              '--banner-height': `${bannerHeight}px`,
              '--toolbar-height': `${toolbarHeight}px`,
              '--content-offset': `${bannerHeight + toolbarHeight + 16}px`,
              minHeight: '100vh',
            } as React.CSSProperties
          }
        >
          <ToasterConfig />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
