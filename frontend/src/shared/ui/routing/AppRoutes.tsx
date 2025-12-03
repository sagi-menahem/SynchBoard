import { lazy, Suspense, useMemo } from 'react';

import { ArrowLeft, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useIsMobile } from 'shared/hooks';
import {
  AppHeader,
  BoardWorkspaceSkeleton,
  Button,
  PageLoader,
  PageTransition,
} from 'shared/ui';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { Layout } from 'shared/ui/layout';
import ProtectedRoute from 'shared/ui/routing/ProtectedRoute';
import RootRedirect from 'shared/ui/routing/RootRedirect';

import styles from './AppRoutes.module.scss';

const AuthPage = lazy(() => import('features/auth/pages/AuthPage'));
const BoardListPage = lazy(() => import('features/board/pages/BoardListPage'));
const BoardDetailsPage = lazy(() => import('features/board/pages/BoardDetailsPage'));
const BoardPage = lazy(() => import('features/board/pages/BoardPage'));
const SettingsPage = lazy(() => import('features/settings/pages/SettingsPage'));

/**
 * Loading component wrapper for lazy-loaded pages with localized messaging.
 */
const LazyPageLoader = () => {
  const { t } = useTranslation(['common']);
  return <PageLoader message={t('common:loading')} />;
};

/**
 * Board-specific loading skeleton that matches the actual board workspace layout.
 * Shows immediately when navigating to a board, before the BoardPage chunk loads.
 */
const BoardPageLoader = () => {
  const { t } = useTranslation(['board']);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
  );

  const handleGoToList = () => {
    navigate(APP_ROUTES.BOARD_LIST);
  };

  return (
    <PageTransition>
      <AppHeader
        leading={
          <>
            <Button variant="icon" onClick={handleGoToList} title={t('board:page.boardListButton')}>
              <ArrowLeft size={20} />
            </Button>
            <Button variant="icon" disabled title={t('board:header.info')}>
              <Info size={20} />
            </Button>
          </>
        }
        title={<span>{t('board:page.loading')}</span>}
      />
      <main className={styles.pageContent}>
        <div className={styles.boardWorkspaceArea}>
          <BoardWorkspaceSkeleton containerStyle={containerStyle} />
        </div>
      </main>
    </PageTransition>
  );
};

/**
 * Main application routing configuration with lazy loading and error boundaries.
 * Defines all application routes with authentication protection and progressive loading.
 * Wraps protected routes with authentication checks and provides error recovery for each route.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/auth"
        element={
          <ErrorBoundary>
            <Suspense fallback={<LazyPageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path={APP_ROUTES.AUTH_CALLBACK}
        element={
          <ErrorBoundary>
            <Suspense fallback={<LazyPageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path={APP_ROUTES.AUTH_ERROR}
        element={
          <ErrorBoundary>
            <Suspense fallback={<LazyPageLoader />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        }
      />

      <Route
        path={APP_ROUTES.BOARD_LIST}
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LazyPageLoader />}>
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
            <ErrorBoundary>
              <Suspense fallback={<BoardPageLoader />}>
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
