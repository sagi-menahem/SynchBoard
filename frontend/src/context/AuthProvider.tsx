import React, { useEffect, useState, type ReactNode } from 'react';

import { jwtDecode } from 'jwt-decode';

import { LOCAL_STORAGE_KEYS } from 'constants/app.constants';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            const decodedToken: { sub: string } = jwtDecode(token);
            setUserEmail(decodedToken.sub);
        } else {
            setUserEmail(null);
        }
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    };

    const value = {
        token,
        userEmail,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
