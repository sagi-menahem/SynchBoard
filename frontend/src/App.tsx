// File: frontend/src/App.tsx

//TODO check import of react
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

/**
 * The root component of the application.
 * It sets up the client-side routing using React Router.
 */
function App() {
  return (
    // <BrowserRouter> enables routing for the entire application.
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        {/* TODO: Add routes for other pages as they are developed.
            As per the project plan, these will include:
            - A page to list all boards the user is a member of.
            - The main board page for collaboration.
            - A user settings page.
        
        <Route path="/boards" element={<BoardListPage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        */}

      </Routes>
    </BrowserRouter>
  );
}

// TODO 

export default App;