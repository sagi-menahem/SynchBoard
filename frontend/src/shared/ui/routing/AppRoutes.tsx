import { lazy, Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { PageLoader } from 'shared/ui';
import { ErrorBoundary } from 'shared/ui/errorBoundary';
import { Layout } from 'shared/ui/layout';
import ProtectedRoute from 'shared/ui/routing/ProtectedRoute';
import RootRedirect from 'shared/ui/routing/RootRedirect';

const AuthPage = lazy(() => import('features/auth/pages/AuthPage'));
const BoardListPage = lazy(() => import('features/board/pages/BoardListPage'));
const BoardDetailsPage = lazy(() => import('features/board/pages/BoardDetailsPage'));
const BoardPage = lazy(() => import('features/board/pages/BoardPage'));
const SettingsPage = lazy(() => import('features/settings/pages/SettingsPage'));

const LazyPageLoader = () => {
  const { t } = useTranslation(['common']);
  return <PageLoader message={t('common:loading')} />;
};

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
