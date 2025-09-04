import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  userEmail: string | null;
  isInitializing: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
