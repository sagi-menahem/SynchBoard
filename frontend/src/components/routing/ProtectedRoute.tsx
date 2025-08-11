import React from 'react';

import { Navigate } from 'react-router-dom';
import logger from 'utils/logger';

import { APP_ROUTES } from 'constants/RoutesConstants';
import { useAuth } from 'hooks/auth/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { token } = useAuth();

    if (!token) {
        logger.warn('SECURITY: Unauthenticated user attempted to access protected route, redirecting to login');
        return <Navigate to={APP_ROUTES.AUTH} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
