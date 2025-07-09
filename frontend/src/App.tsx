// File: frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BoardListPage from './pages/BoardListPage';
import ProtectedRoute from './components/routing/ProtectedRoute';
import BoardPage from './pages/BoardPage'; // 1. Import BoardPage

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route for authentication */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected route for the main board list */}
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <BoardListPage />
            </ProtectedRoute>
          }
        />
        
        {/* 2. Add the new dynamic and protected route for a single board */}
        <Route
          path="/board/:boardId"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;