// File: frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BoardListPage from './pages/BoardListPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { BoardProvider } from './context/BoardProvider';
import BoardPage from './pages/BoardPage';
import Layout from './components/layout/Layout';
import { APP_ROUTES } from './constants/routes.constants';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={APP_ROUTES.AUTH} element={<AuthPage />} />
                
                <Route 
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path={APP_ROUTES.BOARD_LIST}
                        element={<BoardListPage />}
                    />
                    <Route
                        path={APP_ROUTES.BOARD_DETAIL_PATTERN}
                        element={
                            <BoardProvider>
                                <BoardPage />
                            </BoardProvider>
                        }
                    />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;