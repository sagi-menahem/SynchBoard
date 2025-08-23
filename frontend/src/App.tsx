import { APP_ROUTES } from 'constants';

import { useState } from 'react';

import { AuthPage, BoardDetailsPage, BoardListPage, BoardPage, SettingsPage } from 'pages';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthLoadingOverlay } from 'components/auth';

import { ConnectionStatusBanner } from 'components/common';
import { BoardErrorBoundary, PageErrorBoundary } from 'components/errorBoundary';
import { Layout } from 'components/layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';

function App() {
  const [bannerHeight, setBannerHeight] = useState<number>(0);

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

          {/* Global OAuth loading overlay */}
          <AuthLoadingOverlay isVisible={false} />

          <Routes>
            <Route 
              path={APP_ROUTES.AUTH} 
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
        </div>
      </BrowserRouter>
    </PageErrorBoundary>
  );
}

export default App;
