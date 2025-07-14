// File: frontend/src/context/AuthProvider.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import websocketService from '../services/websocketService';
import { LOCAL_STORAGE_KEYS } from '../constants/app.constants';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    useEffect(() => {
        if (token) {
            const decodedToken: { sub: string } = jwtDecode(token);
            setUserEmail(decodedToken.sub);

            websocketService.connect(token, () => {
                console.log("WebSocket connection confirmed in AuthProvider.");
                setIsSocketConnected(true);
            });
        } else {
            setUserEmail(null);
            setIsSocketConnected(false);
        }

        return () => {
            websocketService.disconnect();
            setIsSocketConnected(false);
        };
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    };

    const value = { token, userEmail, isSocketConnected, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};