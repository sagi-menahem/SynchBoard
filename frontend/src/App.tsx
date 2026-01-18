import { ConnectionStatusBanner } from 'features/board/ui';
import React, { useEffect } from 'react';

import { BrowserRouter } from 'react-router-dom';
import { useAppConfiguration } from 'shared/hooks/useAppConfiguration';
import { ToasterConfig } from 'shared/ui/components/ToasterConfig';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { AppRoutes } from 'shared/ui/routing';

// Type declaration for the skeleton hiding function injected by index.html
declare global {
  interface Window {
    __hideSkeletonWhenReady?: () => void;
  }
}

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

  // Signal skeleton to hide after React has painted
  // Uses double requestAnimationFrame to ensure browser has completed first paint
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (typeof window.__hideSkeletonWhenReady === 'function') {
          window.__hideSkeletonWhenReady();
        }
      });
    });
  }, []);

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
        <main
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
        </main>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
