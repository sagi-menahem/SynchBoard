import { LOCAL_STORAGE_KEYS } from 'constants';

import React, { useEffect, useState, type ReactNode } from 'react';

import { jwtDecode } from 'jwt-decode';
import { Logger } from 'utils';

const logger = Logger;

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken: { sub: string } = jwtDecode(token);
                setUserEmail(decodedToken.sub);
                logger.debug('JWT token decoded successfully', { userEmail: decodedToken.sub });
            } catch (error) {
                logger.error('Failed to decode JWT token', error);
                setToken(null);
                localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
            }
        } else {
            setUserEmail(null);
            logger.debug('No JWT token available');
        }
    }, [token]);

    const login = (newToken: string) => {
        logger.info('User login - setting new token');
        setToken(newToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, newToken);
    };

    const logout = () => {
        logger.info('User logout - clearing token');
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
