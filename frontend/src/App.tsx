// File: frontend/src/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

function App() {
  // The App component is now responsible for setting up the application's routing.
  return (
    // <BrowserRouter> should wrap your entire application to enable routing.
    <BrowserRouter>
      {/* <Routes> is a container for all your individual routes. 
          It will render the first <Route> that matches the current URL. */}
      <Routes>
        {/* This <Route> defines a rule:
            - path="/": When the user is at the root URL (e.g., http://localhost:3000/).
            - element={<AuthPage />}: Render the AuthPage component. 
        */}
        <Route path="/" element={<AuthPage />} />

        {/* In the future, you will add more routes here. For example:
            <Route path="/boards" element={<BoardListPage />} />
            <Route path="/board/:boardId" element={<BoardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;