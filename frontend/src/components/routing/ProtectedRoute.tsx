// File: frontend/src/components/routing/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { APP_ROUTES } from '../../constants/routes.constants';

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