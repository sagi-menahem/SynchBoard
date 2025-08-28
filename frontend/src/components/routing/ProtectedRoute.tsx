import { APP_ROUTES } from 'constants';

import React from 'react';

import { Navigate } from 'react-router-dom';
import logger from 'utils/logger';

import { useAuth } from 'hooks/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();
  

  if (!token) {
    logger.warn('[ProtectedRoute] SECURITY: No token found - redirecting to login', {
      attemptedPath: window.location.pathname,
      localStorageHasToken: !!localStorage.getItem('AUTH_TOKEN'),
      timestamp: new Date().toISOString(),
    });
    return <Navigate to={APP_ROUTES.AUTH} replace />;
  }

  return <>{children};</>;
};

export default ProtectedRoute;
