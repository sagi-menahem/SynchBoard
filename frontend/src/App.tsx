// File: frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BoardListPage from './pages/BoardListPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import { BoardProvider } from './context/BoardProvider';
import BoardPage from './pages/BoardPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        
        <Route 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/boards"
            element={<BoardListPage />}
          />
          <Route
            path="/board/:boardId"
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
