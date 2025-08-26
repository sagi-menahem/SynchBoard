import { APP_ROUTES } from 'constants';

import { useEffect, useState } from 'react';

import { AuthPage, BoardDetailsPage, BoardListPage, BoardPage, SettingsPage } from 'pages';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Logger } from 'utils';

import { useLanguageSync } from 'hooks/common';

import { AuthLoadingOverlay } from 'components/auth';
import { ConnectionStatusBanner } from 'components/common';
import { BoardErrorBoundary, PageErrorBoundary } from 'components/errorBoundary';
import { Layout } from 'components/layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';
import RootRedirect from 'components/routing/RootRedirect';

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
          <PageErrorBoundary pageName="Auth">
            <AuthPage />
          </PageErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_CALLBACK} 
        element={
          <PageErrorBoundary pageName="AuthCallback">
            <AuthPage />
          </PageErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_ERROR} 
        element={
          <PageErrorBoundary pageName="AuthError">
            <AuthPage />
          </PageErrorBoundary>
        } 
      />
      

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route 
          path={APP_ROUTES.BOARD_LIST} 
          element={
            <PageErrorBoundary pageName="BoardList">
              <BoardListPage />
            </PageErrorBoundary>
          } 
        />
        <Route 
          path={APP_ROUTES.BOARD_DETAIL_PATTERN} 
          element={
            <PageErrorBoundary pageName="Board">
              <BoardErrorBoundary>
                <BoardPage />
              </BoardErrorBoundary>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path={APP_ROUTES.BOARD_DETAILS_PATTERN} 
          element={
            <PageErrorBoundary pageName="BoardDetails">
              <BoardErrorBoundary>
                <BoardDetailsPage />
              </BoardErrorBoundary>
            </PageErrorBoundary>
          } 
        />
        <Route 
          path={APP_ROUTES.SETTINGS} 
          element={
            <PageErrorBoundary pageName="Settings">
              <SettingsPage />
            </PageErrorBoundary>
          } 
        />
      </Route>
    </Routes>
  );
}

function App() {
  const [bannerHeight, setBannerHeight] = useState<number>(0);
  
  // Initialize global language synchronization
  useLanguageSync();
  
  useEffect(() => {
    logger.info('[App] App component mounted', {
      tokenInLocalStorage: !!localStorage.getItem('AUTH_TOKEN'),
      initialPath: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleBannerHeightChange = (height: number) => {
    setBannerHeight(height);
  };

  return (
    <PageErrorBoundary pageName="App">
      <BrowserRouter>
        <ConnectionStatusBanner onHeightChange={handleBannerHeightChange} />
        <div style={{ 
          paddingTop: `${bannerHeight}px`, 
          transition: 'padding-top 0.3s ease-in-out',
          minHeight: '100vh',
        }}>
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
    </PageErrorBoundary>
  );
}

export default App;
