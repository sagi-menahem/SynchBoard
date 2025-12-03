import { useAuth } from 'features/auth/hooks';
import React from 'react';

import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from 'shared/constants/RoutesConstants';
import { getToken, isTokenValid } from 'shared/utils/authUtils';
import logger from 'shared/utils/logger';

interface ProtectedRouteProps {
  /** Child components to render when user is authenticated */
  children: React.ReactNode;
}

/**
 * Route protection wrapper that enforces authentication requirements.
 * Validates user authentication state and redirects unauthenticated users to login.
 * Checks both React context state and localStorage to handle race conditions during
 * OAuth callbacks where navigation may occur before context state updates.
 *
 * @param children - Child components to render when user is authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token: contextToken } = useAuth();

  // Check both context token AND localStorage to handle race condition during OAuth callback
  // When authLogin(token) is called, localStorage is updated synchronously but React state
  // updates asynchronously. This fallback prevents redirect loops during OAuth flow.
  const localStorageToken = getToken();
  const hasValidToken = contextToken ?? (localStorageToken && isTokenValid(localStorageToken));

  if (!hasValidToken) {
    // Log redirect to login (expected behavior when not authenticated)
    logger.debug('[ProtectedRoute] No valid token found - redirecting to login', {
      attemptedPath: window.location.pathname,
      hasContextToken: !!contextToken,
      hasLocalStorageToken: !!localStorageToken,
      timestamp: new Date().toISOString(),
    });
    return <Navigate to={APP_ROUTES.AUTH} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
