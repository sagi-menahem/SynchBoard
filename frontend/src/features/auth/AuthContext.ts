import { createContext } from 'react';

/**
 * Type definition for the authentication context value object.
 * Provides centralized access to user authentication state and methods
 * for managing login/logout operations throughout the application.
 */
export interface AuthContextType {
  // JWT authentication token, null when user is not authenticated
  token: string | null;
  // Email address of the authenticated user, null when not logged in
  userEmail: string | null;
  // Whether the authentication system is still initializing on app startup
  isInitializing: boolean;
  // Function to authenticate user and store token
  login: (newToken: string) => void;
  // Function to clear authentication state and log out user
  logout: () => void;
}

/**
 * React context for sharing authentication state and methods across the application.
 * Must be accessed through useAuth hook which provides proper error handling
 * for components not wrapped in AuthProvider.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
