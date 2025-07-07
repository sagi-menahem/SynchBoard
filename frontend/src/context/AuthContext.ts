// Located at: frontend/src/context/AuthContext.ts

import { createContext } from 'react';

// Define the shape of the data that the context will provide
export interface AuthContextType {
    token: string | null;
    login: (newToken: string) => void;
    logout: () => void;
}

// Create and export the context object itself.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);