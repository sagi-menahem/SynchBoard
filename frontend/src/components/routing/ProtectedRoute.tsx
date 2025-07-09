// File: frontend/src/components/routing/ProtectedRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // If there is no token, redirect the user to the login page
    return <Navigate to="/" replace />;
  }

  // If there is a token, render the requested component
  return <>{children}</>;
};

export default ProtectedRoute;