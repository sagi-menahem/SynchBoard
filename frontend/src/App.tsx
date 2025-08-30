import { lazy, Suspense, useEffect, useState } from 'react';

import { useAuth } from 'features/auth/hooks';
import AuthPage from 'features/auth/pages/AuthPage';
import BoardListPage from 'features/board/pages/BoardListPage';
import { ConnectionStatusBanner } from 'features/board/ui';
import { useLanguageSync } from 'features/settings/hooks';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { updateDocumentDirection } from 'shared/lib/i18n';
import { PageLoader, PageTransition } from 'shared/ui';
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
      />
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
    document.documentElement.style.setProperty('--toolbar-height', `${toolbarHeight}px`);
  }, [toolbarHeight]);

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
                background: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px var(--color-overlay-medium)',
              },
              success: {
                style: {
                  border: '1px solid var(--color-success)',
                },
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'var(--color-surface-elevated)',
                },
              },
              error: {
                style: {
                  border: '1px solid var(--color-error)',
                },
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'var(--color-surface-elevated)',
                },
              },
              loading: {
                style: {
                  border: '1px solid var(--color-primary)',
                },
                iconTheme: {
                  primary: 'var(--color-primary)',
                  secondary: 'var(--color-surface-elevated)',
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
