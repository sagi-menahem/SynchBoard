import React from 'react';

import { Navigate } from 'react-router-dom';

import { APP_ROUTES } from 'constants/routes.constants';
import { useAuth } from 'hooks/auth/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to={APP_ROUTES.AUTH} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
