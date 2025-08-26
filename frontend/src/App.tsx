import { APP_ROUTES } from 'constants';

import { lazy, Suspense, useEffect, useState } from 'react';

import { updateDocumentDirection } from 'i18n';
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

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('pages/AuthPage'));
const BoardDetailsPage = lazy(() => import('pages/BoardDetailsPage'));
const BoardListPage = lazy(() => import('pages/BoardListPage'));
const BoardPage = lazy(() => import('pages/BoardPage'));
const SettingsPage = lazy(() => import('pages/SettingsPage'));

const logger = Logger;

// Simple loading component for lazy routes
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    color: '#ccc',
    fontSize: '1rem'
  }}>
    Loading...
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_CALLBACK} 
        element={
          <ErrorBoundary type="page" context="AuthCallback">
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_ERROR} 
        element={
          <ErrorBoundary type="page" context="AuthError">
            <Suspense fallback={<PageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        } 
      />
      

      {/* Pages with toolbar - rendered OUTSIDE Layout */}
      <Route 
        path={APP_ROUTES.BOARD_LIST} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="page" context="BoardList">
              <Suspense fallback={<PageLoader />}>
                <BoardListPage />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.BOARD_DETAIL_PATTERN} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="board" context="Board">
              <Suspense fallback={<PageLoader />}>
                <BoardPage />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.BOARD_DETAILS_PATTERN} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="board" context="BoardDetails">
              <Suspense fallback={<PageLoader />}>
                <BoardDetailsPage />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.SETTINGS} 
        element={
          <ProtectedRoute>
            <ErrorBoundary type="page" context="Settings">
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
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
