// Located at: frontend/src/context/AuthProvider.tsx

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';


import { AuthContext } from './AuthContext';

// Define the props for the provider component
interface AuthProviderProps {
    children: ReactNode;
}

// Create and export the provider component.
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('authToken');
    };

    const value = { token, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};