// File: frontend/src/App.tsx
import Layout from 'components/layout/Layout';
import ProtectedRoute from 'components/routing/ProtectedRoute';
import { APP_ROUTES } from 'constants/routes.constants';
import AuthPage from 'pages/AuthPage';
import BoardDetailsPage from 'pages/BoardDetailsPage';
import BoardListPage from 'pages/BoardListPage';
import BoardPage from 'pages/BoardPage';
import SettingsPage from 'pages/SettingsPage';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
    return (
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
                <Route path={APP_ROUTES.AUTH} element={<AuthPage />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route path={APP_ROUTES.BOARD_LIST} element={<BoardListPage />} />
                    <Route path={APP_ROUTES.BOARD_DETAIL_PATTERN} element={<BoardPage />} />
                    <Route path={APP_ROUTES.BOARD_DETAILS_PATTERN} element={<BoardDetailsPage />} />
                    <Route path={APP_ROUTES.SETTINGS} element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
