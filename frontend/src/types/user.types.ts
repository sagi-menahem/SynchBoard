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

// TODO: Add other user-related types here as the application grows.
// e.g., User, LoginRequest, AuthResponse, etc.