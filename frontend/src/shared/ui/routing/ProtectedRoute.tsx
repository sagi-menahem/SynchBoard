import { useAuth } from 'features/auth/hooks';
import React from 'react';

import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import logger from 'shared/utils/logger';

interface ProtectedRouteProps {
  /** Child components to render when user is authenticated */
  children: React.ReactNode;
}

/**
 * Route protection wrapper that enforces authentication requirements.
 * Validates user authentication state and redirects unauthenticated users to login.
 * Provides comprehensive security logging for unauthorized access attempts.
 *
 * @param children - Child components to render when user is authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    // Log security event for unauthorized access attempt
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
