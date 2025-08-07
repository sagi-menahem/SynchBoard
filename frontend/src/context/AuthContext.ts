import { createContext } from 'react';

export interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    login: (newToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
