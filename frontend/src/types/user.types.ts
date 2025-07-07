// File: frontend/src/types/user.types.ts

/**
 * Defines the data structure for a user registration request.
 * This ensures type safety when sending data to the registration endpoint.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

/**
 * Defines the shape of the login request object sent to the API.
 */
export interface LoginRequest {
    email:    string;
    password: string;
}

/**
 * Defines the shape of the successful authentication response from the API.
 */
export interface AuthResponse {
    token: string;
}

// TODO: Add other user-related types here as the application grows.
// e.g., User, LoginRequest, AuthResponse, etc.