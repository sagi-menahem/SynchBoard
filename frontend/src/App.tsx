import { lazy, Suspense, useEffect, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import AuthPage from 'features/auth/pages/AuthPage';
import BoardListPage from 'features/board/pages/BoardListPage';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useLanguageSync } from 'shared/hooks';
import { updateDocumentDirection } from 'shared/lib/i18n';
import { ConnectionStatusBanner, PageLoader, PageTransition } from 'shared/ui';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { Layout } from 'shared/ui/layout';
import ProtectedRoute from 'shared/ui/routing/ProtectedRoute';
import RootRedirect from 'shared/ui/routing/RootRedirect';

const BoardDetailsPage = lazy(() => import('features/board/pages/BoardDetailsPage'));
const BoardPage = lazy(() => import('features/board/pages/BoardPage'));
const SettingsPage = lazy(() => import('features/settings/pages/SettingsPage'));


const LazyPageLoader = () => {
  const { t } = useTranslation(['common']);
  return <PageLoader message={t('common:loading')} />;
};

function AppRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    if (import.meta.env.DEV) {
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
          <ErrorBoundary>
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_CALLBACK} 
        element={
          <ErrorBoundary>
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      <Route 
        path={APP_ROUTES.AUTH_ERROR} 
        element={
          <ErrorBoundary>
            <AuthPage />
          </ErrorBoundary>
        } 
      />
      

      <Route 
        path={APP_ROUTES.BOARD_LIST} 
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <BoardListPage />
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      <Route 
        path={APP_ROUTES.BOARD_DETAIL_PATTERN} 
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LazyPageLoader />}>
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
            <ErrorBoundary>
              <Suspense fallback={<LazyPageLoader />}>
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
            <ErrorBoundary>
              <Suspense fallback={<LazyPageLoader />}>
                <SettingsPage />
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        } 
      />
      
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
      </Route>
    </Routes>
  );
}

function App() {
  const [bannerHeight, setBannerHeight] = useState<number>(0);
  const { i18n, t } = useTranslation(['common', 'auth']);
  const { isInitializing } = useAuth();
  
  const toolbarHeight = 72;
  
  useLanguageSync();
  
  useEffect(() => {
    // Application initialization effect
  }, []);

  useEffect(() => {
    updateDocumentDirection(i18n.language);
  }, [i18n.language]);

  const handleBannerHeightChange = (height: number) => {
    setBannerHeight(height);
  };

  const isOAuthProcessing = sessionStorage.getItem('oauth_loading') === 'true';
  
  if (isOAuthProcessing) {
    return (
      <PageTransition>
        <PageLoader message={t('auth:signingInMessage')} />
      </PageTransition>
    );
  }
  
  if (isInitializing) {
    return (
      <PageTransition>
        <PageLoader message={t('common:loading')} />
      </PageTransition>
    );
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
          transition: 'padding-top 0.3s ease-in-out',
          minHeight: '100vh',
        } as React.CSSProperties}>
          <Toaster
            position="bottom-right"
            gutter={8}
            containerStyle={{
              bottom: 20,
              right: 20,
            }}
            toastOptions={{
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #2f2f2f 0%, #1f1f1f 100%)',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              },
              success: {
                style: {
                  border: 'none',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#2f2f2f',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                style: {
                  border: '1px solid #3b82f6',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />

          <AppRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
