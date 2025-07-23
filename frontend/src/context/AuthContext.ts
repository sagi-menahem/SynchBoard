// File: frontend/src/context/AuthContext.ts
import { createContext } from 'react';
import type { UserPreferences } from 'types/user.types';

export interface AuthContextType {
    token: string | null;
    userEmail: string | null;
    isSocketConnected: boolean;
    preferences: UserPreferences;
    login: (newToken: string) => void;
    logout: () => void;
    updatePreferences: (newPrefs: UserPreferences) => Promise<void>;

}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);