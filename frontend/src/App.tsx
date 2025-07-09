// File: frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import BoardListPage from './pages/BoardListPage';
import ProtectedRoute from './components/routing/ProtectedRoute';

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

        {/* TODO: Add other routes here, e.g., for a specific board or settings */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;