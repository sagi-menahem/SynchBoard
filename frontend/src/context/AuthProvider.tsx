// File: frontend/src/context/AuthProvider.tsx
import React, { useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import websocketService from '../services/websocketService';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isSocketConnected, setIsSocketConnected] = useState(false); // <-- Add state for socket status

    useEffect(() => {
        if (token) {
            const decodedToken: { sub: string } = jwtDecode(token);
            setUserEmail(decodedToken.sub);

            // Connect and update status in the callback
            websocketService.connect(token, () => {
                console.log("WebSocket connection confirmed in AuthProvider.");
                setIsSocketConnected(true); // <-- Set status to true on successful connect
            });
        } else {
            setUserEmail(null);
            setIsSocketConnected(false); // <-- Reset on logout
        }

        return () => {
            websocketService.disconnect();
            setIsSocketConnected(false); // <-- Reset on cleanup
        };
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('authToken');
    };

    // Add isSocketConnected to the provided value
    const value = { token, userEmail, isSocketConnected, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};