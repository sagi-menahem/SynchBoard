import { APP_ROUTES } from 'constants';

import { AuthPage, BoardDetailsPage, BoardListPage, BoardPage, SettingsPage } from 'pages';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { BoardErrorBoundary, PageErrorBoundary } from 'components/errorBoundary';
import { ConnectionStatusBanner } from 'components/common';
import { Layout } from 'components/layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';

function App() {
  return (
    <PageErrorBoundary pageName="App">
      <BrowserRouter>
        <ConnectionStatusBanner />
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
      </BrowserRouter>
    </PageErrorBoundary>
  );
}

export default App;
