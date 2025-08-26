import { APP_ROUTES } from 'constants';

import { useEffect, useState } from 'react';

import { updateDocumentDirection } from 'i18n';
import { AuthPage, BoardDetailsPage, BoardListPage, BoardPage, SettingsPage } from 'pages';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Logger } from 'utils';

import { AuthLoadingOverlay } from 'components/auth';
import { ConnectionStatusBanner } from 'components/common';
import { ErrorBoundary } from 'components/errorBoundary';
import { Layout } from 'components/layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';
import RootRedirect from 'components/routing/RootRedirect';
import { useLanguageSync } from 'hooks/common';

const logger = Logger;

function AppRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.debug('[App] Route changed', {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    }
  }, [location]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={<RootRedirect />}
      />
      
      <Route 
        path="/auth" 
        element={
          <ErrorBoundary type="page" context="Auth">
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_CALLBACK} 
        element={
          <ErrorBoundary type="page" context="AuthCallback">
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_ERROR} 
        element={
          <ErrorBoundary type="page" context="AuthError">
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      

      {/* Pages with toolbar - rendered OUTSIDE Layout */}
      <Route 
        path={APP_ROUTES.BOARD_LIST} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="page" context="BoardList">
              <BoardListPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.BOARD_DETAIL_PATTERN} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="board" context="Board">
              <BoardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.BOARD_DETAILS_PATTERN} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="board" context="BoardDetails">
              <BoardDetailsPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.SETTINGS} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="page" context="Settings">
              <SettingsPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback route for pages that need Layout (currently none) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Reserved for future pages that don't need toolbar */}
      </Route>
    </Routes>
  );
}

function App() {
  const [bannerHeight, setBannerHeight] = useState<number>(0);
  const { i18n } = useTranslation();
  
  // Fixed toolbar height for desktop-only application
  const toolbarHeight = 72;
  
  // Initialize global language synchronization
  useLanguageSync();
  
  useEffect(() => {
    logger.info('[App] App component mounted', {
      tokenInLocalStorage: !!localStorage.getItem('AUTH_TOKEN'),
      initialPath: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // RTL Support: Update document direction when language changes
  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language]);

  const handleBannerHeightChange = (height: number) => {
    setBannerHeight(height);
  };

  return (
    <ErrorBoundary type="page" context="App">
      <BrowserRouter>
        <ConnectionStatusBanner onHeightChange={handleBannerHeightChange} />
        <div style={{ 
          paddingTop: `${bannerHeight}px`,
          '--banner-height': `${bannerHeight}px`,
          '--toolbar-height': `${toolbarHeight}px`,
          '--content-offset': `${bannerHeight + toolbarHeight + 16}px`,
          transition: 'padding-top 0.3s ease-in-out',
          minHeight: '100vh',
        } as React.CSSProperties}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />

          <AuthLoadingOverlay isVisible={false} />

          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
