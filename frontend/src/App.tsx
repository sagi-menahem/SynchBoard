import { APP_ROUTES } from 'constants';

import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Lazy load all page components for better bundle splitting
const AuthPage = React.lazy(() => import('pages/AuthPage'));
const BoardDetailsPage = React.lazy(() => import('pages/BoardDetailsPage'));
const BoardListPage = React.lazy(() => import('pages/BoardListPage'));
const BoardPage = React.lazy(() => import('pages/BoardPage'));
const SettingsPage = React.lazy(() => import('pages/SettingsPage'));

import { BoardErrorBoundary, PageErrorBoundary } from 'components/errorBoundary';
import { Layout } from 'components/layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';

function App() {
    return (
        <PageErrorBoundary pageName="App">
            <BrowserRouter>
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
                                <Suspense fallback={<div>Loading...</div>}>
                                    <AuthPage />
                                </Suspense>
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
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <BoardListPage />
                                    </Suspense>
                                </PageErrorBoundary>
                            } 
                        />
                        <Route 
                            path={APP_ROUTES.BOARD_DETAIL_PATTERN} 
                            element={
                                <PageErrorBoundary pageName="Board">
                                    <BoardErrorBoundary>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <BoardPage />
                                        </Suspense>
                                    </BoardErrorBoundary>
                                </PageErrorBoundary>
                            } 
                        />
                        <Route 
                            path={APP_ROUTES.BOARD_DETAILS_PATTERN} 
                            element={
                                <PageErrorBoundary pageName="BoardDetails">
                                    <BoardErrorBoundary>
                                        <Suspense fallback={<div>Loading...</div>}>
                                            <BoardDetailsPage />
                                        </Suspense>
                                    </BoardErrorBoundary>
                                </PageErrorBoundary>
                            } 
                        />
                        <Route 
                            path={APP_ROUTES.SETTINGS} 
                            element={
                                <PageErrorBoundary pageName="Settings">
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <SettingsPage />
                                    </Suspense>
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
