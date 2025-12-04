import { lazy, Suspense, useMemo } from 'react';

import { ArrowLeft, Info, LayoutGrid, Plus, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { useIsMobile, useMediaQuery } from 'shared/hooks';
import {
  AppHeader,
  AuthPageSkeleton,
  BoardListSkeleton,
  BoardWorkspaceSkeleton,
  Button,
  PageLoader,
  PageTransition,
  SearchBar,
} from 'shared/ui';
import utilStyles from 'shared/ui/styles/utils.module.scss';
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
 * Board list page skeleton that matches the actual board list layout.
 * Shows immediately when navigating to board list, before the BoardListPage chunk loads.
 */
const BoardListPageLoader = () => {
  const { t } = useTranslation(['board']);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isNarrowWindow = useMediaQuery('(max-width: 768px)');

  const containerStyle = useMemo(
    () =>
      ({
        '--background-blur': '0px',
        '--background-size': isMobile ? '280px 280px' : '400px 400px',
      }) as React.CSSProperties,
    [isMobile],
  );

  return (
    <PageTransition className={utilStyles.unifiedDotBackground} style={containerStyle}>
      <AppHeader
        leading={
          <Button
            variant="icon"
            onClick={() => navigate(APP_ROUTES.SETTINGS)}
            title={t('board:listPage.setting')}
          >
            <Settings size={20} />
          </Button>
        }
        center={
          !isNarrowWindow ? (
            <SearchBar placeholder={t('board:toolbar.search.boardName')} disabled />
          ) : undefined
        }
        trailing={
          <>
            <Button variant="icon" disabled title={t('board:toolbar.view.list')}>
              <LayoutGrid size={20} />
            </Button>
            <Button variant="icon" disabled title={t('board:listPage.createNewBoardButton')}>
              <Plus size={20} />
            </Button>
          </>
        }
      />
      {isNarrowWindow && (
        <div className={styles.mobileSearchRow}>
          <SearchBar placeholder={t('board:toolbar.search.boardName')} disabled />
        </div>
      )}
      <main className={styles.boardListPageContent}>
        <BoardListSkeleton viewMode="grid" />
      </main>
    </PageTransition>
  );
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
            <Suspense fallback={<AuthPageSkeleton />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path={APP_ROUTES.AUTH_CALLBACK}
        element={
          <ErrorBoundary>
            <Suspense fallback={<AuthPageSkeleton />}>
              <AuthPage />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path={APP_ROUTES.AUTH_ERROR}
        element={
          <ErrorBoundary>
            <Suspense fallback={<AuthPageSkeleton />}>
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
              <Suspense fallback={<BoardListPageLoader />}>
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
